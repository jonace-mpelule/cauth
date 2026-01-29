import type { Request, Response } from 'express';
import type { _CAuth } from '@/core/src/cauth.ts';
import ErrorValues from '@/core/src/errors/errorValues.ts';
import { RefreshFn } from '@/core/src/fn/refresh.fn';
import type { CAuthOptions } from '@/core/src/types/config.t.ts';

type RefreshDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export function RefreshRoute({ config, tokens }: RefreshDeps) {
	return async (req: Request, res: Response) => {
    try {

      const result = await RefreshFn({
        config: config,
        tokens: tokens,
      }, {refreshToken: req.body.refreshToken})


      if (!result.success) {
        const firstError = result.errors[0].error;
        let status = 400;

        if (firstError.code === ErrorValues.InvalidRefreshToken || firstError.code === ErrorValues.AccountNotFound) {
          status = 401
        }

        if (firstError.code === ErrorValues.ServerError) {
          status = 500
        }

        return res.status(status).send({
          code: firstError.code,
          message: firstError.message,
        });

      }

      return res.status(200).send({
        tokens: result.value.tokens
      })

		} catch (err) {
			console.error('Refresh token error:', err);
			return res.status(500).send({ code: ErrorValues.ServerError });
		}
	};
}
