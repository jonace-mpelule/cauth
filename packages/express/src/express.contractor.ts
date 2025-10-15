import type { RoutesContract } from '@/core/src/types/routes.contract.t';
import { ExpressAuthGuardImpl } from './middleware/authGuard';
import { ChangePasswordRoute } from './routes/change-password.route';
import { LoginRoute } from './routes/login.route';
import { LogoutRoute } from './routes/logout.route';
import { RefreshRoute } from './routes/refresh-token.route';
import { RegisterRoute } from './routes/register.route';

export class ExpressContractor implements RoutesContract {
	Register = () => RegisterRoute;
	Login = () => LoginRoute;
	Logout = () => LogoutRoute;
	Refresh = () => RefreshRoute;
	ChangePassword = () => ChangePasswordRoute;
	Guard = () => ExpressAuthGuardImpl;
}
