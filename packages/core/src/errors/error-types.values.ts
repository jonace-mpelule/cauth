/** biome-ignore-all lint/complexity/noStaticOnlyClass: <''> */
export default class ErrorTypes {
	public static readonly ValidationError = 'validation-error' as const;
	public static readonly CredentialError = 'credential-error' as const;
	public static readonly UnKnownError = 'unknown-error' as const;
	public static readonly InvalidDataError = 'invalid-data-error' as const;
}
