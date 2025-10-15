import { ChangePasswordFn } from './fn/change-password.fn.ts';
import { LoginFn } from './fn/login.fn.ts';
import { LogoutFn } from './fn/logout.fn.ts';
import { RefreshFn } from './fn/refresh.fn.ts';
import { RegisterFn } from './fn/register.fn.ts';
import * as TokenFns from './fn/tokens.ts';

import { type CAuthOptions, CAuthOptionsSchema } from './types/config.t.ts';
import type {
	ChangePasswordSchemaType,
	LoginSchemaType,
	LogoutSchemaType,
	RefreshTokenSchemaType,
	RegisterSchemaType,
} from './types/dto-schemas.t.ts';

export class _CAuth<T extends string[]> {
	#config: Omit<CAuthOptions, 'roles'> & { roles: T };

	constructor(config: Omit<CAuthOptions, 'roles'> & { roles: T }) {
		const parsed = CAuthOptionsSchema.safeParse(config);
		if (!parsed.success) {
			throw new Error(
				`❌ Failed to initiate CAuth. You provided an invalid config!`,
			);
		}

		this.#config = config;
	}

	get RoleType() {
		return null as unknown as T[number];
	}

	/**
	 * @description Authentication Guard Middleware. Include 'roles' for a custom auth guard.
	 *
	 * If 'roles' is empty it allows all authenticated users, without respecting specific role
	 *
	 * @default undefined
	 */
	public Guard = (roles?: Array<T[number]>) =>
		this.#config.routeContractor.Guard({
			config: this.#config,
			tokens: this.Tokens,
			roles,
		});

	public Routes = {
		Register: () =>
			this.#config.routeContractor.Register({
				config: this.#config,
				tokens: this.Tokens,
			}),

		Login: () =>
			this.#config.routeContractor.Login({
				config: this.#config,
				tokens: this.Tokens,
			}),

		Logout: () =>
			this.#config.routeContractor.Logout({
				config: this.#config,
				tokens: this.Tokens,
			}),

		Refresh: () =>
			this.#config.routeContractor.Refresh({
				config: this.#config,
				tokens: this.Tokens,
			}),

		ChangePassword: (userId: string) =>
			this.#config.routeContractor.ChangePassword({
				config: this.#config,
				tokens: this.Tokens,
				userId: userId,
			}),
	};

	public FN = {
		Login: ({ ...args }: LoginSchemaType) =>
			LoginFn({ config: this.#config, tokens: this.Tokens }, args),

		Register: ({ ...args }: RegisterSchemaType) =>
			RegisterFn({ config: this.#config, tokens: this.Tokens }, args),

		Logout: ({ ...args }: LogoutSchemaType) =>
			LogoutFn({ config: this.#config, tokens: this.Tokens }, args),

		Refresh: ({ ...args }: RefreshTokenSchemaType) =>
			RefreshFn({ config: this.#config, tokens: this.Tokens }, args),

		ChangePassword: ({ ...args }: ChangePasswordSchemaType) =>
			ChangePasswordFn({ config: this.#config, tokens: this.Tokens }, args),
	};

	public Tokens = {
		GenerateRefreshToken: (payload: any) =>
			TokenFns.GenerateRefreshToken({ payload, config: this.#config }),

		GenerateAccessToken: (payload: any) =>
			TokenFns.GenerateAccessToken({ payload, config: this.#config }),

		GenerateTokenPairs: (payload: any) =>
			TokenFns.GenerateTokenPairs({ payload, config: this.#config }),

		VerifyRefreshToken: <T>(token: any) =>
			TokenFns.VerifyRefreshToken<T>({ token, config: this.#config }),

		VerifyAccessToken: <T>(token: any) =>
			TokenFns.VerifyAccessToken<T>({ token, config: this.#config }),
	};
}

export function CAuth<const T extends string[]>(
	options: Omit<CAuthOptions, 'roles'> & { roles: T },
) {
	return new _CAuth(options);
}
