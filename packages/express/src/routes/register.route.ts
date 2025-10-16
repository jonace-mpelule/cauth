import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import type { _CAuth } from '@/core/src/cauth.ts';
import ErrorValues from '@/core/src/errors/errorValues.ts';
import { AuthModelSelect } from '@/core/src/types/auth.t.ts';
import type { CAuthOptions } from '@/core/src/types/config.t.ts';
import { RegisterSchema } from '@/core/src/types/dto-schemas.t.ts';
import { formatZodIssues } from '@/core/src/utils/zod-joined-issues.ts';

type RegisterDeps = {
	config: CAuthOptions;
	tokens: _CAuth<any>['Tokens'];
};

export function RegisterRoute({ config, tokens }: RegisterDeps) {
	return async (req: Request, res: Response) => {
		try {
			const out = RegisterSchema.safeParse(req.body);
			if (!out.success) {
				return res.status(400).send({
					code: ErrorValues.InvalidData,
					message: formatZodIssues(out),
				});
			}

			const { email, phoneNumber, role, password } = out.data;

			const isRoleValid = config.roles?.includes(role);

			if (!isRoleValid) {
				return res.status(409).send({
					code: ErrorValues.InvalidRole,
					message: `role should can only be; ${config.roles?.map((e) => e)}`,
				});
			}

			// * CHECK IF ACCOUNT EXIST
			const existing = await config.dbContractor.findAccountWithCredential({
				email,
				phoneNumber,
			});

			if (existing) {
				return res.status(409).send({ code: ErrorValues.DuplicateAccount });
			}

			const passwordHash = await bcrypt.hash(password, 10);

			const account = await config.dbContractor.createAccount({
				data: {
					email,
					phoneNumber,
					passwordHash,
					role: role,
					lastLogin: new Date(),
				},
			});

			// * GENERATE TOKENS
			const tokenPair = await tokens.GenerateTokenPairs({
				id: account.id,
				role,
			});

			// * SAVE THE TOKENS IN DATABASE
			const updatedAccount = await config.dbContractor.updateAccountLogin({
				id: account.id,
				refreshToken: tokenPair.refreshToken,
				select: AuthModelSelect,
			});

			return res
				.status(201)
				.send({ account: updatedAccount, tokens: tokenPair });
		} catch (err) {
			console.error('Register error:', err);
			return res.status(500).send({ code: ErrorValues.ServerError });
		}
	};
}
