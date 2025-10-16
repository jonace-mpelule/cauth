import type { _CAuth } from '@core/cauth.ts';
import { CredentialMismatchError, InvalidDataError } from '@errors/errors.ts';

import bcrypt from 'bcrypt';
import type { CAuthOptions } from '@/core/src/types/config.t.ts';
import type { Account, Tokens } from '../types/auth.t.ts';
import { LoginSchema, type LoginSchemaType } from '../types/dto-schemas.t.ts';
import { fail, ok, type Result } from '../types/result.t.ts';
import { formatZodIssues } from '../utils/zod-joined-issues.ts';

type loginDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

type LoginSuccess = {
	account: Account;
	tokens: Tokens;
};

export async function LoginFn(
	{ config, tokens }: loginDeps,
	{ ...args }: LoginSchemaType,
): Promise<Result<LoginSuccess>> {
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
