/** biome-ignore-all lint/complexity/noStaticOnlyClass: <''> */
export default class ErrorTypes {
	public static readonly ValidationError = 'validation-error';
	public static readonly CredentialError = 'credential-error';
	public static readonly UnKnownError = 'unknown-error';
	public static readonly InvalidDataError = 'invalid-data-error' as const;
}
