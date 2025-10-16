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

/**
 * Generic RoutesContract
 * THandler is generic, defaults to any function
 */
export interface RoutesContract<
	THandler extends (...args: any[]) => any = (...args: any[]) => any,
> {
	Login({ ...config }: RouteDeps): THandler;
	Register({ ...config }: RouteDeps): THandler;
	Logout({ ...config }: RouteDeps): THandler;
	Guard({ ...config }: AuthGuardDeps): THandler;
	Refresh({ ...config }: AuthGuardDeps): THandler;
	ChangePassword({ ...config }: RouteDeps & { userId: string }): THandler;
}
