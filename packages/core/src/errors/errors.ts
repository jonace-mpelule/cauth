/** biome-ignore-all lint/complexity/noStaticOnlyClass: <''> */
import ErrorTypes from './error-types.values.ts';
import ErrorValues from './errorValues.ts';

export type CAuthErrorShape = {
	type: string;
	message: string;
	code: string | number;
	name: string;
};

const CAuthErrors = {
	/** @description Error thrown when the credentials provided do not match. */
	CredentialMismatchError: {
		type: ErrorTypes.CredentialError,
		message: ErrorValues.CredentialMismatchMessage,
		code: ErrorValues.CredentialMismatch,
		name: 'CredentialMismatchError' as const,
	},

	/** @description Error thrown when the data provided is invalid. */
	InvalidDataError: (reason: string): CAuthErrorShape => ({
		type: ErrorTypes.ValidationError,
		message: ErrorValues.InvalidDataMessage(reason),
		code: ErrorValues.InvalidData,
		name: 'InvalidDataError',
	}),

	/** @description Error thrown when the account is not found. */
	AccountNotFoundError: {
		type: ErrorTypes.InvalidDataError,
		message: ErrorValues.AccountNotFoundMessage,
		code: ErrorValues.AccountNotFound,
		name: 'AccountNotFoundError' as const,
	},

	/** @description Error thrown when the role provided is invalid. */
	InvalidRoleError: (roles: string[]): CAuthErrorShape => ({
		type: ErrorTypes.ValidationError,
		message: ErrorValues.InvalidRoleMessage(roles),
		code: ErrorValues.InvalidRole,
		name: 'InvalidRoleError',
	}),

	/** @description Error thrown when an invalid or expired refresh token is provided */
	InvalidRefreshTokenError: {
		type: ErrorTypes.ValidationError,
		message: ErrorValues.InvalidRefreshTokenMessage,
		code: ErrorValues.InvalidRefreshToken,
		name: 'InvalidRefreshTokenError' as const,
	},

	/** @description Error thrown when trying to create an account that already exists */
	DuplicateAccountError: {
		type: ErrorTypes.ValidationError,
		message: ErrorValues.DuplicateAccountMessage,
		code: ErrorValues.DuplicateAccount,
		name: 'DuplicateAccountError' as const,
	},

	/** @description Error thrown when an invalid or expired OTP is provided */
	InvalidOTPCode: {
		type: ErrorTypes.ValidationError,
		message: ErrorValues.InvalidOtpMessage,
		code: ErrorValues.InvalidOtp,
		name: 'InvalidOTPCode' as const,
	},

	/** @description Error thrown when CAuth Schema error */
	SchemaInvalidError: {
		type: ErrorTypes.ValidationError,
		message: ErrorValues.SchemaValidationMessage,
		code: ErrorValues.SchemaValidationError,
		name: 'SchemaInvalidError',
	},
};

// ---------- Helpers ----------

type CAuthErrorObject =
	| ReturnType<
			Extract<
				(typeof CAuthErrors)[keyof typeof CAuthErrors],
				(...args: any) => any
			>
	  >
	| Extract<(typeof CAuthErrors)[keyof typeof CAuthErrors], object>;

function isCAuthError(
	err: unknown,
	name: keyof typeof CAuthErrors,
): err is CAuthErrorObject {
	return (
		typeof err === 'object' &&
		err !== null &&
		'name' in err &&
		(err as any).name === name
	);
}

function is(err: unknown, name: keyof typeof CAuthErrors): boolean {
	return isCAuthError(err, name);
}

// attach helper methods

export { CAuthErrors, is, isCAuthError };
