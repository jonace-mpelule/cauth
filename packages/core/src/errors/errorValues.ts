export default class ErrorValues {
	#_: any;

	public static readonly ServerError = 'internal-server-error';
	public static readonly ServerErrorMessage =
		'Internal server error. We are working to fix this, please try again later';

	public static readonly InvalidToken = 'invalid-token';
	public static readonly InvalidTokenMessage = 'Invalid Token';

	public static readonly ForbiddenResource = 'forbidden-resource';
	public static readonly ForbiddenResourceMessage =
		"You don't have sufficient permission for this action";

	public static readonly InvalidOtp = 'invalid-otp';
	public static readonly InvalidOtpMessage =
		'Invalid Otp. Please check and try again';

	public static readonly CredentialMismatch = 'credential-mismatch';
	public static readonly CredentialMismatchMessage =
		'Credential mismatch. Please check your credentials and try again.';

	public static readonly InvalidData = 'invalid-data';
	public static readonly InvalidDataMessage = (reason: string) =>
		`Invalid Body: ${reason}`;

	public static readonly AccountNotFound = 'account-not-found';
	public static readonly AccountNotFoundMessage = 'Account not found';

	public static readonly InvalidRole = 'invalid-role';
	public static readonly InvalidRoleMessage = (roles: string[]) =>
		`Role is invalid, please use one of the following roles: ${roles.join(', ')}`;

	public static readonly InvalidRefreshToken = 'invalid-refresh-token';
	public static readonly InvalidRefreshTokenMessage = 'Invalid refresh token';

	public static readonly DuplicateAccount = 'account-already-exists';
	public static readonly DuplicateAccountMessage =
		'Account with this credentials already exists';
}
