import z from 'zod';

export const AuthModelSchema = z.object({
	id: z.string(),
	phoneNumber: z.string(),
	email: z.string(),
	passwordHash: z.string().optional(),
	role: z.string(),
	lastLogin: z.date(),
	refreshTokens: z.string().array().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type AuthModel = z.infer<typeof AuthModelSchema>;

export const AuthModelSelect = {
	id: true,
	phoneNumber: true,
	email: true,
	passwordHash: false,
	role: true,
	lastLogin: true,
	refreshTokens: false,
	createdAt: true,
	updatedAt: true,
};

export const OtpSchema = z.object({
	id: z.string(),
	auth: AuthModelSchema.optional(),
	code: z.string(),
	purpose: z.string(),
	expiresAt: z.date(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type OtpType = z.infer<typeof OtpSchema>;
