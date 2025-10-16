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

export class ExpressContractor implements RoutesContract {
	Register = ({ config, tokens }: RouteDeps) =>
		RegisterRoute({ config, tokens });
	Login = ({ config, tokens }: RouteDeps) => LoginRoute({ config, tokens });
	Logout = ({ config, tokens }: RouteDeps) => LogoutRoute({ config, tokens });
	Refresh = ({ config, tokens }: RouteDeps) => RefreshRoute({ config, tokens });
	ChangePassword = ({
		config,
		tokens,
		userId,
	}: RouteDeps & { userId: string }) =>
		ChangePasswordRoute({ config, tokens, userId });
	Guard = ({ config, tokens, roles }: AuthGuardDeps) =>
		ExpressAuthGuardImpl({ tokens, config, roles });
}
