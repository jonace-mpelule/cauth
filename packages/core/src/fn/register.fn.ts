import type { _CAuth } from '@core/cauth.ts';
import type { CAuthOptions } from '@core/types/config.t.ts';
import {
	RegisterSchema,
	type RegisterSchemaType,
} from '@core/types/dto-schemas.t.ts';
import {
	DuplicateAccountError,
	InvalidDataError,
	InvalidRoleError,
} from '@errors/errors.ts';
import { formatZodIssues } from '@utils/zod-joined-issues.ts';
import bcrypt from 'bcrypt';
import { fail, ok, type Result } from '@/core/src/types/result.t.ts';
import type { Account, Tokens } from '../types/auth.t.ts';

type RegisterDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

type RefreshSuccess = {
	account: Account;
	tokens: Tokens;
};

export async function RegisterFn(
	{ config, tokens }: RegisterDeps,
	{ ...args }: RegisterSchemaType,
): Promise<Result<RefreshSuccess>> {
	const out = RegisterSchema.safeParse(args);
	if (!out.success) {
		return fail({
			type: InvalidDataError.type,
			error: new InvalidDataError(formatZodIssues(out)),
		});
	}

	const isRoleValid = config.roles?.includes(args.role);

	if (!isRoleValid) {
		return fail({
			type: InvalidRoleError.type,
			error: new InvalidRoleError(config.roles),
		});
	}

	const existing = await config.dbContractor.findAccountWithCredential({
		email: args.email,
		phoneNumber: args.phoneNumber,
	});
	if (existing) {
		return fail({
			type: DuplicateAccountError.type,
			error: new DuplicateAccountError(),
		});
	}

	const passwordHash = await bcrypt.hash(args.password, 10);

	const account = await config.dbContractor.createAccount({
		data: {
			email: args.email,
			phoneNumber: args.phoneNumber,
			passwordHash,
			role: args.role,
			lastLogin: new Date(),
		},
	});

	const tokenPair = await tokens.GenerateTokenPairs({
		id: account.id,
		role: account.role,
	});
	await config.dbContractor.updateAccountLogin({
		id: account.id,
		refreshToken: tokenPair.refreshToken,
	});

	return ok({ account, tokens: tokenPair });
}
