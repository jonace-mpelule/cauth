import type { _CAuth } from '@/core/src/cauth.ts';
import type { CAuthOptions } from '@/core/src/types/config.t.ts';
import {
	ChangePasswordSchema,
	type ChangePasswordSchemaType,
} from '@/core/src/types/dto-schemas.t.ts';
import { formatZodIssues } from '@/core/src/utils/zod-joined-issues.ts';
import { CAuthErrors } from '../errors/errors.ts';
import { fail, ok, type Result } from '../types/result.t.ts';
import bcrypt from "bcrypt";


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


	const passwordMatch = await bcrypt.compare(
		String(args.oldPassword),
		String(account.passwordHash)
	);

	if (!passwordMatch) {
		return fail({
			error: CAuthErrors.CredentialMismatchError,
		});
	}

	const newHash = await bcrypt.hash(args.newPassword, 10);

	await config.dbContractor.updateAccount({
		id: account.id,
		data: { passwordHash: newHash },
	});

	return ok({});
}
