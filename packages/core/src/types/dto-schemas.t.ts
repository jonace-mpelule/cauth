import { z } from 'zod';
import { phoneWithLibSchema } from './phonenumber-schema.t.ts';

// * EMAIL LOGIN DTO

const EmailLogin = z.object({
	email: z.email(),
	phoneNumber: z.never().optional(),
	password: z.string().min(6).optional(),
});

const PhoneLogin = z.object({
	phoneNumber: phoneWithLibSchema,
	email: z.never().optional(),
	password: z.string().min(6).optional(),
});

export const LoginSchema = z
	.union([EmailLogin, PhoneLogin])
	.superRefine((data, ctx) => {
		if (data.email && data.phoneNumber) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Provide either email or phoneNumber',
				path: ['email', 'phoneNumber'],
			});
		}
	});

export type LoginSchemaType = z.infer<typeof LoginSchema>;

// * EMAIL REGISTRATION DTO
const Register = z.object({
	phoneNumber: phoneWithLibSchema.optional(),
	email: z.email().optional(),
	role: z.string(),
	password: z.string().optional(),
});

export const RegisterSchema = Register.superRefine((data, ctx) => {
	if (!data.email && !data.phoneNumber) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Provide either email or phoneNumber',
			path: ['email', 'phoneNumber'],
		});
	}
});

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;

// * REFRESH TOKEN DTO
export const RefreshTokenSchema = z.object({
	refreshToken: z.string(),
});

export type RefreshTokenSchemaType = z.infer<typeof RefreshTokenSchema>;

// * LOGOUT SCHEMA

export const LogoutSchema = z.object({
	refreshToken: z.string(),
});

export type LogoutSchemaType = z.infer<typeof LogoutSchema>;

// * CHANGE PASSWORD SCHEMA

export const ChangePasswordSchema = z.object({
	accountId: z.string(),
	oldPassword: z.string(),
	newPassword: z.string(),
});

export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;
