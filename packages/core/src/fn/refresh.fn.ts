import type { _CAuth } from '../cauth.ts';
import {
	AccountNotFoundError,
	InvalidDataError,
	InvalidRefreshTokenError,
} from '../errors/errors.ts';
import type { AuthModel } from '../types/auth.t.ts';
import type { CAuthOptions } from '../types/config.t.ts';
import {
	RefreshTokenSchema,
	type RefreshTokenSchemaType,
} from '../types/dto-schemas.t.ts';
import { fail, ok, type Result } from '../types/result.t.ts';
import { tryCatch } from '../utils/tryCatch.ts';
import { formatZodIssues } from '../utils/zod-joined-issues.ts';

type RefreshDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

type RefreshSuccess = {
	account: Omit<AuthModel, 'passwordHash' | 'refreshTokens'>;
	tokens: Awaited<ReturnType<_CAuth<any>['Tokens']['GenerateTokenPairs']>>;
};

export async function RefreshFn(
	{ config, tokens }: RefreshDeps,
	{ ...args }: RefreshTokenSchemaType,
): Promise<Result<RefreshSuccess>> {
	const out = RefreshTokenSchema.safeParse(args);

	if (!out.success) {
		return fail({
			type: InvalidDataError.type,
			error: new InvalidDataError(formatZodIssues(out)),
		});
	}

	const payload = await tryCatch(
		tokens.VerifyRefreshToken<{ id: string }>(args.refreshToken),
	);

	if (payload.error) {
		return fail({
			type: InvalidRefreshTokenError.type,
			error: new InvalidRefreshTokenError(),
		});
	}

	const account = await config.dbContractor.findAccountById({
		id: String(payload.data?.id),
	});

	if (!account) {
		return fail({
			type: AccountNotFoundError.type,
			error: new AccountNotFoundError(),
		});
	}

	if (!account?.refreshTokens?.includes(args.refreshToken)) {
		return fail({
			type: InvalidRefreshTokenError.type,
			error: new InvalidRefreshTokenError(),
		});
	}

	const tokenPair = await tokens.GenerateTokenPairs({
		id: account.id,
		role: account.role,
	});

	await config.dbContractor.removeAndAddRefreshToken({
		id: account.id,
		refreshToken: args.refreshToken,
		newRefreshToken: tokenPair.refreshToken,
	});

	// REMOVE PASSWORD AND REFRESH TOKENS
	delete account.refreshTokens;
	delete account.passwordHash;

	return ok({ account, tokens: tokenPair });
}
