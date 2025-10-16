import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import type { _CAuth } from '@/core/src/cauth.ts';
import ErrorValues from '@/core/src/errors/errorValues.ts';
import { AuthModelSelect } from '@/core/src/types/auth.t.ts';
import type { CAuthOptions } from '@/core/src/types/config.t.ts';
import { LoginSchema } from '@/core/src/types/dto-schemas.t.ts';
import { formatZodIssues } from '@/core/src/utils/zod-joined-issues.ts';

type loginDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export function LoginRoute({ config, tokens }: loginDeps) {
	return async (req: Request, res: Response) => {
		try {
			const out = LoginSchema.safeParse(req.body);
			if (!out.success) {
				return res.status(400).send({
					code: ErrorValues.InvalidData,
					message: formatZodIssues(out),
				});
			}

			const { email, phoneNumber, password } = out.data;

			const account = await config.dbContractor.findAccountWithCredential({
				email,
				phoneNumber,
			});

			if (!account) {
				return res.status(409).send({
					code: ErrorValues.CredentialMismatch,
					message: ErrorValues.CredentialMismatchMessage,
				});
			}

			const passwordMatch = await bcrypt.compare(
				password,
				String(account.passwordHash),
			);

			if (!passwordMatch) {
				return res.status(409).send({ code: ErrorValues.CredentialMismatch });
			}

			// GENERATE TOKENS
			const tokenPair = await tokens.GenerateTokenPairs({
				id: account.id,
				role: account.role,
			});

			// UPDATE ACCOUNT REFRESH TOKENS & LAST LOGIN
			const updatedAccount = await config.dbContractor.updateAccountLogin({
				id: account.id,
				refreshToken: tokenPair.refreshToken,
				select: AuthModelSelect,
			});

			return res
				.status(200)
				.send({ account: updatedAccount, tokens: tokenPair });
		} catch (err) {
			console.error('Login error:', err);
			return res.status(500).send({ code: ErrorValues.ServerError });
		}
	};
}
