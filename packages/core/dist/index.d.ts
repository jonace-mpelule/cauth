import z$1, { z } from "zod";
import ms from "ms";

//#region src/types/auth.t.d.ts
type Account = {
  id: string;
  phoneNumber: string;
  email: string;
  role: string;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
};
type Tokens = {
  accessToken: string;
  refreshToken: string;
};
declare const AuthModelSchema: z$1.ZodObject<{
  id: z$1.ZodString;
  phoneNumber: z$1.ZodString;
  email: z$1.ZodString;
  passwordHash: z$1.ZodOptional<z$1.ZodString>;
  role: z$1.ZodString;
  lastLogin: z$1.ZodDate;
  refreshTokens: z$1.ZodOptional<z$1.ZodArray<z$1.ZodString>>;
  createdAt: z$1.ZodDate;
  updatedAt: z$1.ZodDate;
}, z$1.z.core.$strip>;
type AuthModel = z$1.infer<typeof AuthModelSchema>;
//#endregion
//#region src/errors/errors.d.ts
type CAuthErrorShape = {
  type: string;
  message: string;
  code: string | number;
  name: string;
};
declare const CAuthErrors: {
  /** @description Error thrown when the credentials provided do not match. */
  CredentialMismatchError: {
    type: "credential-error";
    message: "Credential mismatch. Please check your credentials and try again.";
    code: "credential-mismatch";
    name: "CredentialMismatchError";
  };
  /** @description Error thrown when the data provided is invalid. */
  InvalidDataError: (reason: string) => CAuthErrorShape;
  /** @description Error thrown when the account is not found. */
  AccountNotFoundError: {
    type: "invalid-data-error";
    message: "Account not found";
    code: "account-not-found";
    name: "AccountNotFoundError";
  };
  /** @description Error thrown when the role provided is invalid. */
  InvalidRoleError: (roles: string[]) => CAuthErrorShape;
  /** @description Error thrown when an invalid or expired refresh token is provided */
  InvalidRefreshTokenError: {
    type: "validation-error";
    message: "Invalid refresh token";
    code: "invalid-refresh-token";
    name: "InvalidRefreshTokenError";
  };
  /** @description Error thrown when trying to create an account that already exists */
  DuplicateAccountError: {
    type: "validation-error";
    message: "Account with this credentials already exists";
    code: "account-already-exists";
    name: "DuplicateAccountError";
  };
  /** @description Error thrown when an invalid or expired OTP is provided */
  InvalidOTPCode: {
    type: "validation-error";
    message: "Invalid Otp. Please check and try again";
    code: "invalid-otp";
    name: "InvalidOTPCode";
  };
  /** @description Error thrown when CAuth Schema error */
  SchemaInvalidError: {
    type: "validation-error";
    message: "Your database error is not is sync with CAuth Spec";
    code: "schema-validation";
    name: string;
  };
};
type CAuthErrorObject = ReturnType<Extract<(typeof CAuthErrors)[keyof typeof CAuthErrors], (...args: any) => any>> | Extract<(typeof CAuthErrors)[keyof typeof CAuthErrors], object>;
declare function isCAuthError(err: unknown, name: keyof typeof CAuthErrors): err is CAuthErrorObject;
declare function is(err: unknown, name: keyof typeof CAuthErrors): boolean;
//#endregion
//#region src/types/result.t.d.ts
type FNError = {
  error: CAuthErrorShape;
};
/**
 * @description Core Result type.
 * @template T - The type of the value.
 * @template E - The type of the errors, which must extend { type: string; error: Error }.
 */
type Result<T, E extends FNError = FNError> = {
  success: true;
  value: T;
} | {
  success: false;
  errors: E[];
};
//#endregion
//#region src/types/otp-purpose.t.d.ts
type OtpPurpose = 'LOGIN' | 'RESET_PASSWORD' | 'ACTION';
//#endregion
//#region src/types/database.contract.d.ts
interface DatabaseContract {
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
  deleteAccount({
    ...args
  }: {
    id: string;
  }): Promise<void>;
  createOTP<T = {
    code: string;
    purpose: string;
    expiresAt: Date;
  }>({
    config
  }: {
    config: CAuthOptions;
  }, {
    ...args
  }: {
    id: string;
    purpose: OtpPurpose;
  }): Promise<T>;
  verifyOTP<T = {
    isValid: boolean;
  }>({
    ...args
  }: {
    id: string;
    code: string;
    purpose: OtpPurpose;
  }): Promise<T>;
}
//#endregion
//#region src/types/routes.contract.t.d.ts
type RouteDeps = {
  config: CAuthOptions;
  tokens: _CAuth<any>['Tokens'];
};
type AuthGuardDeps = {
  config: CAuthOptions;
  tokens: _CAuth<any>['Tokens'];
  roles?: Array<string>;
};
/**
 * Generic RoutesContract
 * THandler is generic, defaults to any function
 */
interface RoutesContract<THandler extends (...args: any[]) => any = (...args: any[]) => any> {
  Login({
    ...config
  }: RouteDeps): THandler;
  Register({
    ...config
  }: RouteDeps): THandler;
  Logout({
    ...config
  }: RouteDeps): THandler;
  Guard({
    ...config
  }: AuthGuardDeps): THandler;
  Refresh({
    ...config
  }: AuthGuardDeps): THandler;
  ChangePassword({
    ...config
  }: RouteDeps & {
    userId: string;
  }): THandler;
}
//#endregion
//#region src/types/config.t.d.ts
declare const CAuthOptionsSchema: z$1.ZodObject<{
  dbContractor: z$1.ZodCustom<DatabaseContract, DatabaseContract>;
  routeContractor: z$1.ZodCustom<RoutesContract<(...args: any[]) => any>, RoutesContract<(...args: any[]) => any>>;
  roles: z$1.ZodArray<z$1.ZodString>;
  jwtConfig: z$1.ZodObject<{
    refreshTokenSecret: z$1.ZodString;
    accessTokenSecret: z$1.ZodString;
    accessTokenLifeSpan: z$1.ZodOptional<z$1.ZodCustom<ms.StringValue, ms.StringValue>>;
    refreshTokenLifeSpan: z$1.ZodOptional<z$1.ZodCustom<ms.StringValue, ms.StringValue>>;
  }, z$1.z.core.$strip>;
  otpConfig: z$1.ZodObject<{
    expiresIn: z$1.ZodOptional<z$1.ZodNumber>;
    length: z$1.ZodOptional<z$1.ZodNumber>;
  }, z$1.z.core.$strip>;
}, z$1.z.core.$strip>;
type CAuthOptions = z$1.infer<typeof CAuthOptionsSchema>;
//#endregion
//#region src/types/dto-schemas.t.d.ts
declare const LoginSchema: z.ZodUnion<readonly [z.ZodObject<{
  email: z.ZodEmail;
  phoneNumber: z.ZodOptional<z.ZodNever>;
  password: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodObject<{
  phoneNumber: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
  email: z.ZodOptional<z.ZodNever>;
  password: z.ZodOptional<z.ZodString>;
}, z.core.$strip>]>;
type LoginSchemaType = z.infer<typeof LoginSchema>;
declare const OTPCodeUnion: z.ZodUnion<readonly [z.ZodObject<{
  email: z.ZodEmail;
  phoneNumber: z.ZodOptional<z.ZodNever>;
  code: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
  phoneNumber: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
  email: z.ZodOptional<z.ZodNever>;
  code: z.ZodString;
}, z.core.$strip>]>;
type OTPLogin = z.infer<typeof OTPCodeUnion>;
declare const RequestOTPCodeSchema: z.ZodUnion<readonly [z.ZodObject<{
  otpPurpose: z.ZodEnum<{
    LOGIN: "LOGIN";
    RESET_PASSWORD: "RESET_PASSWORD";
    ACTION: "ACTION";
  }>;
  usePassword: z.ZodDefault<z.ZodBoolean>;
  password: z.ZodOptional<z.ZodString>;
  phoneNumber: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
  email: z.ZodOptional<z.ZodNever>;
}, z.core.$strip>, z.ZodObject<{
  otpPurpose: z.ZodEnum<{
    LOGIN: "LOGIN";
    RESET_PASSWORD: "RESET_PASSWORD";
    ACTION: "ACTION";
  }>;
  usePassword: z.ZodDefault<z.ZodBoolean>;
  password: z.ZodOptional<z.ZodString>;
  phoneNumber: z.ZodOptional<z.ZodNever>;
  email: z.ZodString;
}, z.core.$strip>]>;
type RequestOTP = z.infer<typeof RequestOTPCodeSchema>;
declare const RegisterSchema: z.ZodObject<{
  phoneNumber: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
  email: z.ZodOptional<z.ZodEmail>;
  role: z.ZodString;
  password: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type RegisterSchemaType = z.infer<typeof RegisterSchema>;
declare const RefreshTokenSchema: z.ZodObject<{
  refreshToken: z.ZodString;
}, z.core.$strip>;
type RefreshTokenSchemaType = z.infer<typeof RefreshTokenSchema>;
declare const LogoutSchema: z.ZodObject<{
  refreshToken: z.ZodString;
}, z.core.$strip>;
type LogoutSchemaType = z.infer<typeof LogoutSchema>;
declare const ChangePasswordSchema: z.ZodObject<{
  accountId: z.ZodString;
  oldPassword: z.ZodString;
  newPassword: z.ZodString;
}, z.core.$strip>;
type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;
//#endregion
//#region src/cauth.d.ts
declare class _CAuth<T extends string[], TContractor extends RoutesContract<any> = RoutesContract<any>> {
  #private;
  constructor(config: Omit<CAuthOptions, 'roles'> & {
    roles: T;
    routeContractor: TContractor;
  });
  get RoleType(): T[number];
  /**
   * @description Auth guard middleware — roles optional.
   * Automatically typed as the handler type from the contractor (e.g. Express.RequestHandler).
   */
  Guard: (roles?: Array<T[number]>) => (...args: any[]) => any;
  /**
   * Route Handlers — typed from the contractor automatically.
   */
  Routes: {
    Register: () => ReturnType<TContractor["Register"]>;
    Login: () => ReturnType<TContractor["Login"]>;
    Logout: () => ReturnType<TContractor["Logout"]>;
    Refresh: () => ReturnType<TContractor["Refresh"]>;
    ChangePassword: (userId: string) => ReturnType<TContractor["ChangePassword"]>;
  };
  FN: {
    Login: ({
      ...args
    }: LoginSchemaType) => Promise<Result<{
      account: Account;
      tokens: Tokens;
    }>>;
    Register: ({
      ...args
    }: RegisterSchemaType) => Promise<Result<{
      account: Account;
      tokens: Tokens;
    }>>;
    Logout: ({
      ...args
    }: LogoutSchemaType) => Promise<Result<unknown>>;
    Refresh: ({
      ...args
    }: RefreshTokenSchemaType) => Promise<Result<{
      account: Account;
      tokens: Tokens;
    }>>;
    ChangePassword: ({
      ...args
    }: ChangePasswordSchemaType) => Promise<Result<unknown>>;
    RequestOTPCode: ({
      ...args
    }: RequestOTP) => Promise<Result<{
      id: string;
      code: string;
    }>>;
    LoginWithOTP: (args: OTPLogin) => Promise<Result<{
      account: Account;
      tokens: Tokens;
    }>>;
    VerifyOTP: (args: {
      id: string;
      code: string;
      otpPurpose: OtpPurpose;
    }) => Promise<Result<{
      isValid: boolean;
    }>>;
  };
  Tokens: {
    GenerateRefreshToken: (payload: any) => Promise<string>;
    GenerateAccessToken: (payload: any) => Promise<string>;
    GenerateTokenPairs: (payload: any) => Promise<{
      accessToken: string;
      refreshToken: string;
    }>;
    VerifyRefreshToken: <R>(token: any) => Promise<R | null>;
    VerifyAccessToken: <R>(token: any) => Promise<R | null>;
  };
}
/**
 * return typed instance of `_CAuth` while preserving contractor type.
 */
declare function CAuth<const T extends string[], const TContractor extends RoutesContract<any>>(options: Omit<CAuthOptions, 'roles'> & {
  roles: T;
  routeContractor: TContractor;
}): _CAuth<T, TContractor>;
//#endregion
export { CAuth, CAuthErrors, type CAuthOptions, type DatabaseContract, type RoutesContract, is, isCAuthError };