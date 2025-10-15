import type { Request, Response } from 'express';
import type { _CAuth } from '@/core/src/cauth';
import ErrorValues from '@/core/src/errors/errorValues';
import type { CAuthOptions } from '@/core/src/types/config.t';
import { RefreshTokenSchema } from '@/core/src/types/dto-schemas.t';
import { formatZodIssues } from '@/core/src/utils/zod-joined-issues';

type RefreshDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export function RefreshRoute({ config, tokens }: RefreshDeps) {
	return async (req: Request, res: Response) => {
		try {
			const out = RefreshTokenSchema.safeParse(req.body);
			if (!out.success) {
				return res.status(400).send({
					code: ErrorValues.InvalidData,
					message: formatZodIssues(out),
				});
			}
			const { refreshToken } = out.data;

			// VERIFY TOKEN
			const payload = await tokens.VerifyRefreshToken<{ id: string }>(
				refreshToken,
			);
			if (!payload)
				return res.status(401).send({ code: ErrorValues.InvalidToken });

			const account = await config.dbContractor.findAccountById({
				id: payload.id,
			});
			if (!account) {
				return res.status(404).send({ code: ErrorValues.AccountNotFound });
			}
			// CHECK THAT REFRESH TOKEN EXISTS IN DB
			if (!account?.refreshTokens?.includes(refreshToken)) {
				return res.status(401).send({ code: ErrorValues.InvalidToken });
			}

			// GENERATE NEW PAIR
			const tokenPair = await tokens.GenerateTokenPairs({
				id: account.id,
				role: account.role,
			});

			// UPDATE DB WITH NEW REFRESH TOKEN (PUSH & REMOVE OLD)
			await config.dbContractor.removeAndAddRefreshToken({
				id: account.id,
				refreshToken,
				newRefreshToken: tokenPair.refreshToken,
			});

			return res.status(200).send({ tokens: tokenPair });
		} catch (err) {
			console.error('Refresh token error:', err);
			return res.status(500).send({ code: ErrorValues.ServerError });
		}
	};
}
