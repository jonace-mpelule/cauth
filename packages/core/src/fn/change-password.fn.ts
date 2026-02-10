import type { _CAuth } from '@/core/src/cauth.ts';
import type { CAuthOptions } from '@/core/src/types/config.t.ts';
import {
	ChangePasswordSchema,
	type ChangePasswordSchemaType,
} from '@/core/src/types/dto-schemas.t.ts';
import { formatZodIssues } from '@/core/src/utils/zod-joined-issues.ts';
import { CAuthErrors } from '../errors/errors.ts';
import { fail, ok, type Result } from '../types/result.t.ts';
import argon2 from "argon2-browser";


type ChangePasswordDeps = {
	config: CAuthOptions;
	tokens?: _CAuth<any>['Tokens'];
};

export async function ChangePasswordFn(
	{ config }: ChangePasswordDeps,
	{ ...args }: ChangePasswordSchemaType,
): Promise<Result<unknown>> {
	const out = ChangePasswordSchema.safeParse(args);

	if (!out.success) {
		return fail({
			error: CAuthErrors.InvalidDataError(formatZodIssues(out)),
		});
	}

	const account = await config.dbContractor.findAccountById({
		id: args.accountId,
	});

	if (!account) {
		return fail({
			error: CAuthErrors.CredentialMismatchError,
		});
	}


	const passwordMatch = await argon2.verify({
		pass: String(args.oldPassword),
		encoded: String(account.passwordHash)
	},
	);

	if (!passwordMatch) {
		return fail({
			error: CAuthErrors.CredentialMismatchError,
		});
	}

	const newHash = await argon2.hash({
		pass: args.newPassword,
		salt: 'salt123'
	})

	await config.dbContractor.updateAccount({
		id: account.id,
		data: { passwordHash: newHash },
	});

	return ok({});
}
