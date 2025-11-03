export default class ErrorValues {
	#_: any;

	public static readonly ServerError = 'internal-server-error' as const;
	public static readonly ServerErrorMessage =
		'Internal server error. We are working to fix this, please try again later' as const;

	public static readonly InvalidToken = 'invalid-token' as const;
	public static readonly InvalidTokenMessage = 'Invalid Token' as const;

	public static readonly ForbiddenResource = 'forbidden-resource' as const;
	public static readonly ForbiddenResourceMessage =
		"You don't have sufficient permission for this action" as const;

	public static readonly InvalidOtp = 'invalid-otp' as const;
	public static readonly InvalidOtpMessage =
		'Invalid Otp. Please check and try again' as const;

	public static readonly CredentialMismatch = 'credential-mismatch' as const;
	public static readonly CredentialMismatchMessage =
		'Credential mismatch. Please check your credentials and try again.' as const;

	public static readonly InvalidData = 'invalid-data' as const;
	public static readonly InvalidDataMessage = (reason: string) =>
		`Invalid Body: ${reason}` as const;

	public static readonly AccountNotFound = 'account-not-found' as const;
	public static readonly AccountNotFoundMessage = 'Account not found' as const;

	public static readonly InvalidRole = 'invalid-role' as const;
	public static readonly InvalidRoleMessage = (roles: string[]) =>
		`Role is invalid, please use one of the following roles: ${roles.join(', ')}`;

	public static readonly InvalidRefreshToken = 'invalid-refresh-token' as const;
	public static readonly InvalidRefreshTokenMessage =
		'Invalid refresh token' as const;

	public static readonly DuplicateAccount = 'account-already-exists' as const;
	public static readonly DuplicateAccountMessage =
		'Account with this credentials already exists' as const;

	public static readonly SchemaValidationError = 'schema-validation' as const;
	public static readonly SchemaValidationMessage =
		'Your database error is not is sync with CAuth Spec' as const;
}
