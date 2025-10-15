import type { _CAuth } from '@core/cauth.ts';
import {
	InvalidDataError,
	InvalidRefreshTokenError,
} from '@core/errors/errors.ts';
import type { CAuthOptions } from '@core/types/config.t.ts';
import {
	LogoutSchema,
	type LogoutSchemaType,
} from '@core/types/dto-schemas.t.ts';
import { tryCatch } from '@core/utils/tryCatch.ts';
import { formatZodIssues } from '@core/utils/zod-joined-issues.ts';
import { fail, ok, type Result } from '@/core/src/types/result.t.ts';

type LogoutDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export async function LogoutFn(
	{ config, tokens }: LogoutDeps,
	{ ...args }: LogoutSchemaType,
): Promise<Result<unknown>> {
	const out = LogoutSchema.safeParse(args);

	if (!out.success) {
		return fail({
			type: InvalidDataError.type,
			error: new InvalidDataError(formatZodIssues(out)),
		});
	}

	const payload = await tryCatch(
		tokens.VerifyRefreshToken<{ id: string }>(args.refreshToken),
	);

	if (payload.error || !payload) {
		return fail({
			type: InvalidRefreshTokenError.type,
			error: new InvalidRefreshTokenError(),
		});
	}

	await config.dbContractor.removeAndAddRefreshToken({
		id: String(payload.data?.id),
		refreshToken: args.refreshToken,
	});

	return ok({});
}
