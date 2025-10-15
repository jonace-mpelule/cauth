import type { RoutesContract } from '@/core/src/types/routes.contract.t';
import { ExpressAuthGuardImpl } from './middleware/authGuard';
import { ExpressLoginImpl } from './routes/loginRoute';
import { ExpressLogoutImpl } from './routes/logoutRoute';

export class ExpressContractor implements RoutesContract {
	Login = () => ExpressLoginImpl;

	Logout = () => ExpressLogoutImpl;

	Guard = () => ExpressAuthGuardImpl;
}
