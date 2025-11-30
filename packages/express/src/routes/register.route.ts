import type { Request, Response } from 'express';
import type { _CAuth } from '@/core/src/cauth.ts';
import { RegisterFn } from '@/core/src/fn/register.fn.ts';
import type { CAuthOptions } from '@/core/src/types/config.t.ts';
import ErrorValues from '@/core/src/errors/errorValues.ts';

type RegisterDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export function RegisterRoute({ config, tokens }: RegisterDeps) {
	return async (req: Request, res: Response) => {
		try {
			// Pass role from body, as RegisterFn expects it
			const result = await RegisterFn({ config, tokens }, req.body);

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

			return res.status(201).send(result.value);
		} catch (err) {
			console.error('Register error:', err);
			return res.status(500).send({ code: ErrorValues.ServerError });
		}
	};
}
