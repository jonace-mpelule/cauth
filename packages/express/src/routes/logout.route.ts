import type { Request, Response } from 'express';
import type { _CAuth } from '@/core/src/cauth';
import ErrorValues from '@/core/src/errors/errorValues';
import type { CAuthOptions } from '@/core/src/types/config.t';
import { LogoutSchema } from '@/core/src/types/dto-schemas.t';
import { formatZodIssues } from '@/core/src/utils/zod-joined-issues';

type LogoutDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export function LogoutRoute({ config, tokens }: LogoutDeps) {
	return async (req: Request, res: Response) => {
		try {
			const out = LogoutSchema.safeParse(req.body);

			if (!out.success) {
				return res.status(400).send({
					code: ErrorValues.InvalidData,
					message: formatZodIssues(out),
				});
			}

			const { refreshToken } = out.data;

			const payload = await tokens.VerifyRefreshToken<{ id: string }>(
				refreshToken,
			);

			if (!payload) {
				return res.status(401).send({ code: 'invalid-refresh-token' });
			}

			await config.dbContractor.removeAndAddRefreshToken({
				id: payload.id,
				refreshToken: refreshToken,
			});

			return res.status(200).send({ code: 'logged-out' });
		} catch (err) {
			console.error('Logout error:', err);
			return res.status(500).send({ code: 'server-error' });
		}
	};
}
