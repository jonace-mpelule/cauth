import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import type { _CAuth } from '@/core/src/cauth';
import ErrorValues from '@/core/src/errors/errorValues';
import type { CAuthOptions } from '@/core/src/types/config.t';
import { ChangePasswordSchema } from '@/core/src/types/dto-schemas.t';
import { formatZodIssues } from '@/core/src/utils/zod-joined-issues';

type ChangePasswordDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
	userId: string;
};

export function ChangePasswordRoute({ config, userId }: ChangePasswordDeps) {
	return async (req: Request, res: Response) => {
		try {
			const out = ChangePasswordSchema.safeParse(req.body);
			if (!out.success) {
				return res.status(400).send({
					code: ErrorValues.InvalidData,
					message: formatZodIssues(out),
				});
			}

			const account = await config.dbContractor.findAccountById({
				id: userId,
			});

			if (!account) {
				return res.status(404).send({
					code: ErrorValues.AccountNotFound,
					message: ErrorValues.AccountNotFoundMessage,
				});
			}

			// CHECK OLD PASSWORD
			const passwordMatch = await bcrypt.compare(
				out.data.oldPassword,
				String(account.passwordHash),
			);

			if (!passwordMatch) {
				return res.status(401).send({
					code: ErrorValues.CredentialMismatch,
					message: ErrorValues.CredentialMismatchMessage,
				});
			}

			// HASH & UPDATE NEW PASSWORD
			const newHash = await bcrypt.hash(out.data.newPassword, 10);
			await config.dbContractor.updateAccount({
				id: account.id,
				data: {
					passwordHash: newHash,
				},
			});

			return res.status(200).send({ code: 'password-changed' });
		} catch (err) {
			console.error('ChangePassword error:', err);
			return res.status(500).send({ code: ErrorValues.ServerError });
		}
	};
}
