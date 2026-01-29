import type { Request, Response } from 'express';
import type { _CAuth } from '@/core/src/cauth.ts';
import { LoginFn } from '@/core/src/fn/login.fn.ts';
import ErrorValues from '@/core/src/errors/errorValues.ts';
import type { CAuthOptions } from '@/core/src/types/config.t.ts';

type loginDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export function LoginRoute({ config, tokens }: loginDeps) {
	return async (req: Request, res: Response) => {
		try {
			const result = await LoginFn({ config, tokens }, req.body);

			if (!result.success) {
				const firstError = result.errors[0].error;
				let status = 400;

				if (firstError.code === ErrorValues.CredentialMismatch) {
					status = 409;
				} else if (firstError.code === ErrorValues.ServerError) {
					status = 500;
				}

				return res.status(status).send({
					code: firstError.code,
					message: firstError.message,
				});
			}

			return res.status(200).send(result.value);
		} catch (_) {
			return res.status(500).send({ code: ErrorValues.ServerError });
		}
	};
}
