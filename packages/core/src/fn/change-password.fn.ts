import type { _CAuth } from '@core/cauth.ts';
import type { CAuthOptions } from '@core/types/config.t.ts';
import {
	ChangePasswordSchema,
	type ChangePasswordSchemaType,
} from '@core/types/dto-schemas.t.ts';
import {
	AccountNotFoundError,
	CredentialMismatchError,
	InvalidDataError,
} from '@errors/errors.ts';
import { formatZodIssues } from '@utils/zod-joined-issues.ts';
import bcrypt from 'bcrypt';
import { fail, ok, type Result } from '@/core/src/types/result.t.ts';

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
			type: InvalidDataError.type,
			error: new InvalidDataError(formatZodIssues(out)),
		});
	}

	const account = await config.dbContractor.findAccountById({
		id: args.accountId,
	});

	if (!account) {
		return fail({
			type: AccountNotFoundError.type,
			error: new AccountNotFoundError(),
		});
	}

	const passwordMatch = bcrypt.compare(
		args.oldPassword,
		String(account.passwordHash),
	);

	if (!passwordMatch) {
		return fail({
			type: CredentialMismatchError.type,
			error: new CredentialMismatchError(),
		});
	}

	const newHash = await bcrypt.hash(args.newPassword, 10);
	await config.dbContractor.updateAccount({
		id: account.id,
		data: { passwordHash: newHash },
	});

	return ok({});
}
