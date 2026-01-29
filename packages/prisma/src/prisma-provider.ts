import { randomInt } from 'node:crypto';
import type { CAuthOptions } from '@core/types/config.t.ts';
import type { DatabaseContract } from '@core/types/database.contract.ts';
import argon2 from 'argon2';
import ms, { type StringValue } from 'ms';
import type { AuthModel } from '@/core/src/types/auth.t.ts';
import type { OtpPurpose } from '@/core/src/types/otp-purpose.t.ts';
import type { RefreshTokenJson } from '@/core/src/types/refresh-token.t';
import {
	hashRefreshToken,
	verifyRefreshToken,
} from '@/core/src/utils/hmac-util.ts';

export interface PrismaClientLike {
	$connect: () => Promise<void>;
	$disconnect: () => Promise<void>;
	$transaction: (...args: any[]) => Promise<any>;
	[model: string]: any;
}

export class PrismaContractor<TClient extends PrismaClientLike>
	implements DatabaseContract
{
	#client: TClient;

	constructor(client: TClient) {
		this.#client = client;
	}

	async createOTP<T = { code: string; purpose: string; expiresAt: Date }>(
		{ config }: { config: CAuthOptions },
		{
			...args
		}: {
			id: string;
			purpose: OtpPurpose;
		},
	): Promise<T> {
		// Enforcing range between 4–8 defaults to 6 digits
		const otpLength = Math.min(Math.max(config?.otpConfig?.length ?? 6, 4), 8);

		// Generate random numeric OTP
		const code = Array.from({ length: otpLength }, () => randomInt(0, 10)).join(
			'',
		);

		// Calculate expiration time
		const expiresInMs = config?.otpConfig?.expiresIn ?? 5 * 60 * 1000;
		const expiresAt = new Date(Date.now() + expiresInMs);

		// Hash the otp Code
		const hashCode = await argon2.hash(code, { type: argon2.argon2id });

		let otp: any;

		try {
			otp = await (this.#client as any).otp.update({
				where: {
					id: args.id,
				},
				data: {
					code: hashCode,
					isUsed: false,
					purpose: args.purpose as any,
					expiresAt,
				},
			});
		} catch (err: any) {
			if (err.code === 'P2025') {
				otp = await (this.#client as any).otp.create({
					data: {
						id: args.id,
						code: hashCode,
						isUsed: false,
						purpose: args.purpose as any,
						expiresAt,
					},
				});
			}
		}

		return { code: code, purpose: otp.purpose, expiresAt } as T;
	}

	async verifyOTP<T = { isValid: boolean }>({
		...args
	}: {
		id: string;
		code: string;
		purpose: OtpPurpose;
	}): Promise<T> {
		const otp = await (this.#client as any).otp.findFirst({
			where: {
				id: args.id,
			},
		});

		if (!otp) {
			return { isValid: false } as T;
		}
		const isMatch = await argon2.verify(args.code, otp.code);

		if (!isMatch)
			return {
				isValid: false,
			} as T;

		if (otp.isUsed) {
			return { isValid: false } as T;
		}

		if (otp.expiresAt.getTime() < Date.now()) {
			return { isValid: false } as T;
		}

		if (otp.purpose !== args.purpose) {
			return { isValid: false } as T;
		}

		await (this.#client as any).otp.update({
			where: { id: otp.id },
			data: { isUsed: true },
		});

		return {
			isValid: true,
		} as T;
	}

	async findAccountById<T>({ id }: { id: string }) {
		return (await (this.#client as any).auth.findFirst({
			where: { id },
		})) as T;
	}

	async findAccountWithCredential({
		...args
	}: {
		email?: string;
		phoneNumber?: string;
		select?: any;
	}) {
		return await (this.#client as any).auth.findFirst({
			where: {
				OR: [{ email: args.email }, { phoneNumber: args.phoneNumber }],
			},
			select: args.select,
		});
	}

	async createAccount({ ...args }: { data: any; select?: any }) {
		return await (this.#client as any).auth.create({ data: args.data });
	}

	async removeAndAddRefreshToken<T>({
		id,
		refreshToken,
		select,
		newRefreshToken,
		config,
	}: {
		id: string;
		refreshToken: string;
		select?: any;
		newRefreshToken?: string;
		config: CAuthOptions;
	}): Promise<T> {
		/**
		 * Checking Account Id
		 */
		const account = await this.findAccountById<AuthModel | null>({ id });

		if (!account) {
			throw new Error(`account-not-found: ${id}`);
		}

		const hash = hashRefreshToken({
			token: String(newRefreshToken),
			refreshTokenSecret: config.jwtConfig.refreshTokenSecret,
		});

		const _newRefreshObj: RefreshTokenJson = {
			token: hash,
			exp: ms(config.jwtConfig.refreshTokenLifeSpan as StringValue),
		};

		// Go through tokens and remove the current one

		let updatedTokens = account?.refreshTokens?.filter((t) =>
			verifyRefreshToken({
				incomingToken: refreshToken,
				storedHash: t.token,
				refreshTokenSecret: config.jwtConfig.refreshTokenSecret,
			}),
		);

		if (newRefreshToken) {
			updatedTokens?.push(_newRefreshObj);
			updatedTokens = Array.from(new Set(updatedTokens));
		}

		return (this.#client as any).auth.update({
			where: { id },
			data: { refreshTokens: { set: updatedTokens } },
			select,
		}) as Promise<T>;
	}

	async updateAccountLogin({
		...args
	}: {
		id: string;
		refreshToken: string;
		select?: any;
		config: CAuthOptions;
	}) {
		// Create Refresh Token
		const hash = hashRefreshToken({
			token: args.refreshToken,
			refreshTokenSecret: args.config.jwtConfig.refreshTokenSecret,
		});

		const _refreshObj: RefreshTokenJson = {
			token: hash,
			exp: ms(args.config.jwtConfig.refreshTokenLifeSpan as StringValue),
		};

		return (this.#client as any).auth.update({
			where: {
				id: args.id,
			},
			data: {
				lastLogin: new Date(),
				refreshTokens: {
					push: _refreshObj,
				},
			},
			select: args.select,
		});
	}

	async updateAccount({ ...args }: { id: string; data: any }) {
		return await (this.#client as any).auth.update({
			where: { id: args.id },
			data: args.data,
		});
	}

	async deleteAccount({ id }: { id: string }) {
		return await (this.#client as any).auth.delete({ where: { id } });
	}
}
