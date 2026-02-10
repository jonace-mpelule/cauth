import argon2 from '@node-rs/argon2';
import type { _CAuth } from '@/core/src/cauth.ts';
import Strings from '@/core/src/helpers/strings.ts';
import type { CAuthOptions } from '@/core/src/types/config.t.ts';
import {
	LoginSchema, OTPCodeUnion,
	type OTPLogin,
	type RequestOTP
} from '@/core/src/types/dto-schemas.t.ts';
import { CAuthErrors } from '../errors/errors.ts';

import type { Account, Tokens } from '../types/auth.t.ts';
import type { OtpPurpose } from '../types/otp-purpose.t.ts';
import { fail, ok, type Result } from '../types/result.t.ts';
import { formatZodIssues } from '../utils/zod-joined-issues.ts';

// Common Dep
type AuthenticateDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

type AuthCodeResult = {
	id: string;
};

export async function RequestAuthCode(
	{ config }: AuthenticateDeps,
	{ ...args }: RequestOTP & { onCode: (code: string) => any },
): Promise<Result<AuthCodeResult>> {
	const out = LoginSchema.safeParse({
		email: args.email,
		phoneNumber: args.phoneNumber,
	});

	if (!out.success) {
		return fail({
			error: CAuthErrors.InvalidDataError(formatZodIssues(out)),
		});
	}

	const account = await config.dbContractor.findAccountWithCredential({
		phoneNumber: args.phoneNumber,
		email: args.email,
	});

	if (!account) {
		return fail({ error: CAuthErrors.CredentialMismatchError });
	}

	// Optional password check
	if (args.usePassword) {
		const passwordMatch = await argon2.verify(
			String(args.password),
			String(account?.passwordHash)
		);

		if (!passwordMatch) {
			return fail({ error: CAuthErrors.CredentialMismatchError });
		}
	}

	// MAKE SURE OTP EXISTS

	const otp = await config.dbContractor.createOTP(
		{ config },
		{
			id: account.id,
			purpose: args.otpPurpose,
		},
	);

	args.onCode(otp.code);

	return ok({
		id: account.id,
	});
}

type LoginWithCodeResult = {
	account: Account;
	tokens: Tokens;
};

export async function LoginWithCode(
	{ config, tokens }: AuthenticateDeps,
	args: OTPLogin,
): Promise<Result<LoginWithCodeResult>> {
	// Parse OTP Schema
	const out = OTPCodeUnion.safeParse({
		phoneNumber: args.phoneNumber,
		email: args.email,
		code: args.code,
	});

	if (!out.success) {
		return fail({
			error: CAuthErrors.InvalidDataError(formatZodIssues(out)),
		});
	}

	const account = await config.dbContractor.findAccountWithCredential({
		email: args.email,
		phoneNumber: args.phoneNumber,
	});

	if (!account) {
		return fail({
			error: CAuthErrors.CredentialMismatchError,
		});
	}

	const codeValidation = await config.dbContractor.verifyOTP({
		id: account.id,
		code: args.code,
		purpose: Strings.LoginPurpose,
	});

	if (!codeValidation.isValid) {
		return fail({
			error: CAuthErrors.InvalidOTPCode,
		});
	}

	const tokenPair = await tokens.GenerateTokenPairs({
		id: account.id,
		role: account.role,
	});

	await config.dbContractor.updateAccountLogin({
		id: account.id,
		refreshToken: tokenPair.refreshToken,
		config
	});

	delete account.passwordHash;
	delete (account as any).refreshTokens;

	return ok({
		account,
		tokens: tokenPair,
	});
}

type VerifyAuthCodeResult = {
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
