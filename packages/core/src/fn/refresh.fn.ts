import type { _CAuth } from '../cauth.ts';
import { CAuthErrors } from '../errors/errors.ts';
import type { Account, Tokens } from '../types/auth.t.ts';
import type { CAuthOptions } from '../types/config.t.ts';
import {
	RefreshTokenSchema,
	type RefreshTokenSchemaType,
} from '../types/dto-schemas.t.ts';
import { fail, ok, type Result } from '../types/result.t.ts';
import { verifyRefreshToken } from '../utils/hmac-util.ts';
import { tryCatch } from '../utils/tryCatch.ts';
import { formatZodIssues } from '../utils/zod-joined-issues.ts';

type RefreshDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

type RefreshSuccess = {
	account: Account;
	tokens: Tokens;
};

export async function RefreshFn(
	{ config, tokens }: RefreshDeps,
	{...args} : RefreshTokenSchemaType,
): Promise<Result<RefreshSuccess>> {
	const out = RefreshTokenSchema.safeParse(args);

	if (!out.success) {
		return fail({
			error: CAuthErrors.InvalidDataError(formatZodIssues(out)),
		});
	}

  const payload = await tryCatch(
    // TODO: Change this to Refresh Token
		tokens.VerifyRefreshToken<{ id: string }>(args.refreshToken),
	);

	if (payload.error) {
		return fail({
			error: CAuthErrors.InvalidRefreshTokenError,
		});
	}

	const account = await config.dbContractor.findAccountById({
		id: String(payload.data?.id),
	});

	if (!account) {
		return fail({
			error: CAuthErrors.AccountNotFoundError,
		});
	}



  if (!account?.refreshTokens?.some((r) => verifyRefreshToken({ incomingToken: args.refreshToken, storedHash: r.token, refreshTokenSecret:config.jwtConfig.refreshTokenSecret}))) {
		return fail({
			error: CAuthErrors.InvalidRefreshTokenError,
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
	delete (account as any).refreshTokens;
	delete account.passwordHash;

	return ok({ account, tokens: tokenPair });
}
