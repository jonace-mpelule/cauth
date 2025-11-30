import type { _CAuth } from '@/core/src/cauth.ts';
import {
	LogoutSchema,
	type LogoutSchemaType,
} from '@/core/src/types/dto-schemas.t.ts';
import { tryCatch } from '@core/utils/tryCatch.ts';
import { formatZodIssues } from "@/core/src/utils/zod-joined-issues.ts";
import { CAuthErrors } from '../errors/errors.ts';
import type { CAuthOptions } from '../types/config.t.ts';
import { fail, ok, type Result } from '../types/result.t.ts';

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
			error: CAuthErrors.InvalidDataError(formatZodIssues(out)),
		});
	}

	const payload = await tryCatch(
		tokens.VerifyRefreshToken<{ id: string }>(args.refreshToken),
	);

	if (payload.error || !payload) {
		return fail({
			error: CAuthErrors.InvalidRefreshTokenError,
		});
	}

	await config.dbContractor.removeAndAddRefreshToken({
		id: String(payload.data?.id),
		refreshToken: args.refreshToken,
	});

	return ok({});
}
