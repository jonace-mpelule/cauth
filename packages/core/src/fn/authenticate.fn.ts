import type { _CAuth } from '@core/cauth.ts';
import Strings from '@core/helpers/strings.ts';
import type { CAuthOptions } from '@core/types/config.t.ts';
import {
	LoginSchema,
	type LoginSchemaType,
} from '@core/types/dto-schemas.t.ts';
import {
	CredentialMismatchError,
	InvalidDataError,
	InvalidOTPCode,
} from '@errors/errors.ts';
import { formatZodIssues } from '@utils/zod-joined-issues.ts';
import bcrypt from 'bcrypt';
import { fail, ok, type Result } from '@/core/src/types/result.t.ts';
import type { Account, Tokens } from '../types/auth.t.ts';
import type { OtpPurpose } from '../types/otp-purpose.t.ts';

// Common Dep
type AuthenticateDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export type AuthCodeResult = {
	id: string;
	code: string;
};

export async function RequestAuthCode(
	{ config }: AuthenticateDeps,
	args: Omit<LoginSchemaType, 'password'> & {
		email?: string;
		phoneNumber?: string;
		password?: string;
		usePassword?: boolean;
		otpPurpose: OtpPurpose;
	},
): Promise<Result<AuthCodeResult>> {
	const out = LoginSchema.safeParse({
		email: args.email,
		phoneNumber: args.phoneNumber,
		password: '',
	});

	if (!out.success) {
		return fail({
			type: InvalidDataError.type,
			error: new InvalidDataError(formatZodIssues(out)),
		});
	}

	const account = await config.dbContractor.findAccountWithCredential({
		phoneNumber: args.phoneNumber,
		email: args.email,
	});

	if (!account) {
		return fail({
			type: CredentialMismatchError.type,
			error: new CredentialMismatchError(),
		});
	}

	// Optional password check
	if (args.usePassword) {
		const passwordMatch = await bcrypt.compare(
			String(args.password),
			String(account?.passwordHash),
		);

		if (!passwordMatch) {
			return fail({
				type: CredentialMismatchError.type,
				error: new CredentialMismatchError(),
			});
		}
	}

	const otp = await config.dbContractor.createOTP(
		{ config },
		{
			id: account.id,
			purpose: args.otpPurpose,
		},
	);

	return ok({
		id: account.id,
		code: otp.code,
	});
}

export type LoginWithCodeResult = {
	account: Account;
	tokens: Tokens;
};

export async function LoginWithCode(
	{ config, tokens }: AuthenticateDeps,
	args: Omit<LoginSchemaType, 'password'> & { code: string },
): Promise<Result<LoginWithCodeResult>> {
	const out = LoginSchema.safeParse({
		email: args.email,
		phoneNumber: args.phoneNumber,
		password: '',
	});

	if (!out.success) {
		return fail({
			type: InvalidDataError.type,
			error: new InvalidDataError(formatZodIssues(out)),
		});
	}

	const account = await config.dbContractor.findAccountWithCredential({
		email: args.email,
		phoneNumber: args.phoneNumber,
	});

	if (!account) {
		return fail({
			type: CredentialMismatchError.type,
			error: new CredentialMismatchError(),
		});
	}

	const codeValidation = await config.dbContractor.verifyOTP({
		id: account.id,
		code: args.code,
		purpose: Strings.LoginPurpose,
	});

	if (!codeValidation.isValid) {
		return fail({
			type: InvalidOTPCode.type,
			error: new InvalidOTPCode(),
		});
	}

	const tokenPair = await tokens.GenerateTokenPairs({
		id: account.id,
		role: account.role,
	});

	await config.dbContractor.updateAccountLogin({
		id: account.id,
		refreshToken: tokenPair.refreshToken,
	});

	delete account.passwordHash;
	delete account.refreshTokens;

	return ok({
		account,
		tokens: tokenPair,
	});
}

export type VerifyAuthCodeResult = {
	isValid: boolean;
};

export async function VerifyAuthCode(
	{ config }: AuthenticateDeps,
	args: { id: string; code: string; otpPurpose: OtpPurpose },
): Promise<Result<VerifyAuthCodeResult>> {
	const result = await config.dbContractor.verifyOTP({
		id: args.id,
		code: args.code,
		purpose: args.otpPurpose,
	});

	return ok({ isValid: result.isValid });
}
