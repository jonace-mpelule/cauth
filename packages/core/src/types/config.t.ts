import type ms from 'ms';
import z from 'zod';
import type { DatabaseContract } from './database.contract.ts';
import type { RoutesContract } from './routes.contract.t.ts';

// RUN TIME CHECK FOR DATABASE PROVIDER
const DbContractor = z.custom<DatabaseContract>(() => true, {
	message: 'Invalid dbContractor: must implement Database Contract interface',
});

const RouteContractor = z.custom<RoutesContract>(() => true, {
	message: 'Invalid routeContractor: must implement RoutesContract interface',
});

const MS = z.custom<ms.StringValue>();

export const CAuthOptionsSchema = z.object({
	dbContractor: DbContractor,
	routeContractor: RouteContractor,
	refreshTokenSecret: z.string(),
	accessTokenSecret: z.string(),
	roles: z.array(z.string()).min(1),
	jwtConfig: z
		.object({
			accessTokenLifeSpan: MS.optional(),
			refreshTokenLifeSpan: MS.optional(),
		})
		.optional(),
	otpConfig: z.object({
		/**
		 *  @description OTP Timespan in milliseconds
		 * 	@default  300000 - (5 minutes)
		 */
		expiresIn: z.number().optional(),
		/**
		 * @description Length of OTP Code. 4 to 8 digits
		 * @default 6
		 */
		length: z.number().min(4).max(8).optional(),
	}),
});

export type CAuthOptions = z.infer<typeof CAuthOptionsSchema>;
