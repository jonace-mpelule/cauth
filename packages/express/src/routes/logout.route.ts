import type { Request, Response } from 'express';
import type { _CAuth } from '@/core/src/cauth.ts';
import ErrorValues from '@/core/src/errors/errorValues.ts';
import type { CAuthOptions } from '@/core/src/types/config.t.ts';
import { LogoutFn } from '@/core/src/fn/logout.fn';

type LogoutDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export function LogoutRoute({ config, tokens }: LogoutDeps) {
	return async (req: Request, res: Response) => {
		try {

			const result = await LogoutFn({ config, tokens }, { refreshToken: req.body.refreshToken })


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

			return res.status(200).send({ code: 'logged-out' });
		} catch (err) {
			console.error('Logout error:', err);
			return res.status(500).send({ code: 'server-error' });
		}
	};
}
