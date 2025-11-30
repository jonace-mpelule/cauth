import type { _CAuth } from '@/core/src/cauth.ts';
import type { CAuthOptions } from '@/core/src/types/config.t.ts';
import {
	RegisterSchema,
	type RegisterSchemaType,
} from '@/core/src/types/dto-schemas.t.ts';
import { CAuthErrors } from '@/core/src/errors/errors.ts';
import { formatZodIssues } from '@/core/src/utils/zod-joined-issues.ts';
import Bun from 'bun';
import type { Account, Tokens } from '../types/auth.t.ts';
import { fail, ok, type Result } from '../types/result.t.ts';

type RegisterDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

type RegisterFNResult = {
	account: Account;
	tokens: Tokens;
};

export async function RegisterFn(
	{ config, tokens }: RegisterDeps,
	{
		...args
	}: RegisterSchemaType & {
		role: _CAuth<any>['RoleType'];
	},
): Promise<Result<RegisterFNResult>> {
	const out = RegisterSchema.safeParse(args);
	if (!out.success) {
		return fail({
			error: CAuthErrors.InvalidDataError(formatZodIssues(out)),
		});
	}

	const isRoleValid = config.roles?.includes(args.role);

	if (!isRoleValid) {
		return fail({
			error: CAuthErrors.InvalidRoleError(config.roles),
		});
	}

	const existing = await config.dbContractor.findAccountWithCredential({
		email: args.email,
		phoneNumber: args.phoneNumber,
	});
	if (existing) {
		return fail({
			error: CAuthErrors.DuplicateAccountError,
		});
	}

	const passwordHash = await Bun.password.hash(String(args.password), {
		algorithm: 'bcrypt',
		cost: 10,
	});

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
