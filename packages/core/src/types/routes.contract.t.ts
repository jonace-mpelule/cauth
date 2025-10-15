import type { _CAuth } from '@core/cauth.ts';
import type { CAuthOptions } from '@core/types/config.t.ts';

export type RouteDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export type AuthGuardDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
	roles?: Array<string>;
};

export interface RoutesContract {
	Login({ ...config }: RouteDeps): any;

	Register({ ...config }: RouteDeps): any;

	Logout({ ...config }: RouteDeps): any;

	Guard({ ...config }: AuthGuardDeps): any;

	Refresh({ ...config }: AuthGuardDeps): any;

	ChangePassword({ ...config }: RouteDeps & { userId: string }): any;
}
