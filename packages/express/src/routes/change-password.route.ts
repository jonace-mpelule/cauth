import type { Request, Response } from 'express';
import type { _CAuth } from '@/core/src/cauth.ts';
import ErrorValues from '@/core/src/errors/errorValues.ts';
import type { CAuthOptions } from '@/core/src/types/config.t.ts';
import { ChangePasswordFn } from '@/core/src/fn/change-password.fn';

type ChangePasswordDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
	userId: string;
};

export function ChangePasswordRoute({ config, userId }: ChangePasswordDeps) {
	return async (req: Request, res: Response) => {
		try {


			const result = await ChangePasswordFn({
				config: config,
			}, {
				accountId: userId, oldPassword: req.body.oldPassword, newPassword: req.body.newPassword

			})


			if (!result.success) {
				const firstError = result.errors[0].error;
				let status = 400;

				if (
					firstError.code === ErrorValues.InvalidRole ||
					firstError.code === ErrorValues.DuplicateAccount
				) {
					status = 409;
				} else if (firstError.code === ErrorValues.ServerError) {
					status = 500;
				}

				return res.status(status).send({
					code: firstError.code,
					message: firstError.message,
				});
			}

			return res.status(200).send({ code: 'password-changed' });
		} catch (err) {
			console.error('ChangePassword error:', err);
			return res.status(500).send({ code: ErrorValues.ServerError });
		}
	};
}
