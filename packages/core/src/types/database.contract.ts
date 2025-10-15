import type { AuthModel, OtpType } from './auth.t.ts';
import type { CAuthOptions } from './config.t.ts';
import type { OtpPurpose } from './otp-purpose.t.ts';

export interface DatabaseContract {
	findAccountById<T = AuthModel>({
		...args
	}: {
		id: string;
		select?: any;
	}): Promise<T | undefined>;

	findAccountWithCredential<T = AuthModel>({
		...args
	}: {
		email?: string | undefined;
		phoneNumber?: string | undefined;
		select?: any;
	}): Promise<T | undefined>;

	createAccount<T = AuthModel>({
		...args
	}: {
		data: any;
		select?: any;
	}): Promise<T>;

	updateAccount<T = AuthModel>({
		...args
	}: {
		id: string;
		data: any;
		select?: any;
	}): Promise<T>;

	updateAccountLogin<T = AuthModel>({
		...args
	}: {
		id: string;
		refreshToken: string;
		select?: any;
	}): Promise<T>;

	removeAndAddRefreshToken({
		...args
	}: {
		id: string;
		refreshToken: string;
		newRefreshToken?: string;
		select?: any;
	}): Promise<any>;

	deleteAccount({ ...args }: { id: string }): Promise<void>;

	createOTP<T = OtpType>(
		{ config }: { config: CAuthOptions },
		{
			...args
		}: {
			id: string;
			purpose: OtpPurpose;
		},
	): Promise<T>;

	verifyOTP<T = { isValid: boolean }>({
		...args
	}: {
		id: string;
		code: string;
		purpose: OtpPurpose;
	}): Promise<T>;
}
