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
import type { OtpPurpose } from '../types/otp-purpose.t.ts';

type AuthenticateDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

type RequestAuthCode = {
	id: string;
	code: string;
};

export async function RequestAuthCode(
	{ config }: AuthenticateDeps,
	{
		...args
	}: LoginSchemaType & {
		usePassword?: boolean;
		otpPurpose: OtpPurpose;
	},
): Promise<Result<RequestAuthCode>> {
	const out = LoginSchema.safeParse(args);

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

	// * Use Password When 'usePassword' is set to true
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

	const Otp = await config.dbContractor.createOTP(
		{
			config,
		},
		{
			id: account.id,
			purpose: args.otpPurpose,
		},
	);

	return ok({
		id: account.id,
		code: Otp.code,
	});
}

export async function LoginWithCode(
	{ config, tokens }: AuthenticateDeps,
	{
		...args
	}: Omit<LoginSchemaType, 'password'> & {
		code: string;
	},
) {
	const out = LoginSchema.safeParse(args);

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

export async function VerifyOTP(
	{ config }: AuthenticateDeps,
	{ ...args }: { id: string; code: string; otpPurpose: OtpPurpose },
) {
	return await config.dbContractor.verifyOTP({
		id: args.id,
		code: args.code,
		purpose: args.otpPurpose,
	});
}
