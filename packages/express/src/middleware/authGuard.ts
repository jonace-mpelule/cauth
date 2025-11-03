import type { NextFunction, Request, Response } from 'express';
import ErrorValues from '@/core/src/errors/errorValues.ts';
import type { AuthGuardDeps } from '@/core/src/types/routes.contract.t.ts';
import { tryCatch } from '@/core/src/utils/tryCatch.ts';

/**
 * @description Implements Express Auth Middleware
 */
export function ExpressAuthGuardImpl({ tokens, config, roles }: AuthGuardDeps) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			let token = req.cookies?.accessToken;

			if (!token) {
				const authHeader = req.headers.authorization;
				if (authHeader?.startsWith('Bearer ')) {
					token = authHeader.split(' ')[1];
				}
			}

			if (!token) {
				return res.status(401).send({ code: ErrorValues.InvalidToken });
			}

			const out = await tryCatch(
				tokens.VerifyAccessToken<{ id: string; role: string }>(token),
			);

			if (out.error || !out.data) {
				return res.status(401).send({ code: ErrorValues.InvalidToken });
			}

			// If role is not part of the route allowed roles
			if (roles && !roles.includes(out.data.role)) {
				return res.status(403).send({
					code: ErrorValues.ForbiddenResource,
					message: ErrorValues.ForbiddenResourceMessage,
				});
			}

			// If role is not part of the global roles config
			if (!config.roles.includes(out.data.role)) {
				return res.status(403).send({
					code: ErrorValues.ForbiddenResource,
					message: ErrorValues.ForbiddenResourceMessage,
				});
			}

			(req as any).cauth = {
				id: out.data.id,
				role: out.data.role,
			};

			return next();
		} catch (_) {
			return res.status(500).send({ code: ErrorValues.ServerError });
		}
	};
}
