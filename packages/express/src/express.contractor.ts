import type { NextFunction, Request, Response } from 'express';
import type {
	AuthGuardDeps,
	RouteDeps,
	RoutesContract,
} from '@/core/src/types/routes.contract.t.ts';
import { ExpressAuthGuardImpl } from './middleware/authGuard.ts';
import { ChangePasswordRoute } from './routes/change-password.route.ts';
import { LoginRoute } from './routes/login.route.ts';
import { LogoutRoute } from './routes/logout.route.ts';
import { RefreshRoute } from './routes/refresh-token.route.ts';
import { RegisterRoute } from './routes/register.route.ts';

export type OptionalNextHandler = (
	req: Request,
	res: Response,
	next?: NextFunction,
) => any;

export class ExpressContractor<
	THandler extends (...args: any[]) => any = OptionalNextHandler,
> implements RoutesContract<THandler>
{
	Register = ({ config, tokens }: RouteDeps) =>
		RegisterRoute({ config, tokens }) as unknown as THandler;

	Login = ({ config, tokens }: RouteDeps) =>
		LoginRoute({ config, tokens }) as unknown as THandler;

	Logout = ({ config, tokens }: RouteDeps) =>
		LogoutRoute({ config, tokens }) as unknown as THandler;

	Refresh = ({ config, tokens }: RouteDeps) =>
		RefreshRoute({ config, tokens }) as unknown as THandler;

	ChangePassword = ({
		config,
		tokens,
		userId,
	}: RouteDeps & { userId: string }) =>
		ChangePasswordRoute({ config, tokens, userId }) as unknown as THandler;

	Guard = ({ config, tokens, roles }: AuthGuardDeps) =>
		ExpressAuthGuardImpl({ tokens, config, roles }) as unknown as THandler;
}
