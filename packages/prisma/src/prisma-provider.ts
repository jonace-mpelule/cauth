import type { CAuthOptions } from '@core/types/config.t.ts';
import type { DatabaseContract } from '@core/types/database.contract.ts';
import Bun from "bun";
import type { AuthModel } from '@/core/src/types/auth.t.ts';
import type { OtpPurpose } from '@/core/src/types/otp-purpose.t.ts';

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
		const code = Array.from({ length: otpLength }, () =>
			Math.floor(Math.random() * 10),
		).join('');

		// Calculate expiration time
		const expiresInMs = config?.otpConfig?.expiresIn ?? 5 * 60 * 1000;
		const expiresAt = new Date(Date.now() + expiresInMs);

		// Hash the otp Code
		const hashCode = await Bun.password.hash(code, {
			algorithm: 'bcrypt', 
			cost: 10
		})


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
		const isMatch = await Bun.password.verify(args.code, otp.code)

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
	}: {
		id: string;
		refreshToken: string;
		select?: any;
		newRefreshToken?: string;
	}): Promise<T> {
		const account = await this.findAccountById<AuthModel | null>({ id });
		if (!account) {
			throw new Error(`account-not-found: ${id}`);
		}

		let updatedTokens = account?.refreshTokens?.filter(
			(t: any) => t !== refreshToken,
		);
		if (newRefreshToken) {
			updatedTokens?.push(newRefreshToken);
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
	}) {
		return (this.#client as any).auth.update({
			where: {
				id: args.id,
			},
			data: {
				lastLogin: new Date(),
				refreshTokens: {
					push: args.refreshToken,
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
