/** biome-ignore-all lint/complexity/noStaticOnlyClass: <''> */
import ErrorTypes from './error-types.values.ts';
import ErrorValues from './errorValues.ts';

// Implementing Class 'CError' for ts safety
class CError {
	static type: string;
	public code!: string;
}

/**
 * @description Error thrown when the credentials provided do not match.
 */
export class CredentialMismatchError extends Error implements CError {
	public code: string;
	static type: string = ErrorTypes.CredentialError;
	constructor() {
		super(ErrorValues.CredentialMismatchMessage);
		this.code = ErrorValues.CredentialMismatch;
		this.name = 'CredentialMismatch';
	}
}

/**
 * @description Error thrown when the data provided is invalid.
 */
export class InvalidDataError extends Error implements CError {
	public code: string;
	static type: string = ErrorTypes.ValidationError;
	constructor(reason: string) {
		super(ErrorValues.InvalidDataMessage(reason));
		this.code = ErrorValues.InvalidData;
		this.name = 'InvalidDataError';
	}
}

/**
 * @description Error thrown when the account is not found.
 */
export class AccountNotFoundError extends Error implements CError {
	public code: string;
	static type: string = ErrorTypes.InvalidDataError;
	constructor() {
		super(ErrorValues.AccountNotFoundMessage);
		this.code = ErrorValues.AccountNotFound;
		this.name = 'AccountNotFoundError';
	}
}

/**
 * @description Error thrown when the role provided is invalid.
 */
export class InvalidRoleError extends Error implements CError {
	public code: string;
	static type: string = ErrorTypes.ValidationError;
	constructor(roles: string[]) {
		super(ErrorValues.InvalidRoleMessage(roles));
		this.code = ErrorValues.InvalidRole;
		this.name = 'InvalidRoleError';
	}
}

/**
 * @description Error thrown when an invalid or expired refresh token is provided
 */
export class InvalidRefreshTokenError extends Error implements CError {
	public code: string;
	static type: string = ErrorTypes.ValidationError;
	constructor() {
		super(ErrorValues.InvalidRefreshTokenMessage);
		this.code = ErrorValues.InvalidRefreshToken;
		this.name = 'InvalidRefreshTokenError';
	}
}

/**
 * @description Error thrown when trying to create an account that already exists
 */
export class DuplicateAccountError extends Error implements CError {
	public code: string;
	static type: string = ErrorTypes.ValidationError;
	constructor() {
		super(ErrorValues.DuplicateAccountMessage);
		this.code = ErrorValues.DuplicateAccount;
		this.name = 'DuplicateAccountError';
	}
}

/**
 * @description Error thrown when an invalid or expired OTP is provided
 */
export class InvalidOTPCode extends Error implements CError {
	public code: string;
	static type: string = ErrorTypes.ValidationError;

	constructor() {
		super(ErrorValues.InvalidOtpMessage);
		this.code = ErrorValues.InvalidOtp;
		this.name = 'InvalidOTPCode';
	}
}
