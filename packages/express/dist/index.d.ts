import { NextFunction, Request, Response } from "express";
import z$1, { z } from "zod";
import ms from "ms";

//#region ../core/src/types/auth.t.d.ts
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
//#region ../core/src/types/result.t.d.ts
type FNError = {
  type: string;
  error: Error;
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
//#region ../core/src/types/otp-purpose.t.d.ts
type OtpPurpose = 'LOGIN' | 'RESET_PASSWORD' | 'ACTION';
//#endregion
//#region ../core/src/types/database.contract.d.ts
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
//#region ../core/src/types/config.t.d.ts
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
//#region ../core/src/types/dto-schemas.t.d.ts
declare const LoginSchema: z.ZodUnion<readonly [z.ZodObject<{
  email: z.ZodEmail;
  phoneNumber: z.ZodOptional<z.ZodNever>;
  password: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
  phoneNumber: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
  email: z.ZodOptional<z.ZodNever>;
  password: z.ZodString;
}, z.core.$strip>]>;
type LoginSchemaType = z.infer<typeof LoginSchema>;
declare const RegisterSchema: z.ZodObject<{
  phoneNumber: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
  email: z.ZodOptional<z.ZodEmail>;
  role: z.ZodString;
  password: z.ZodString;
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
//#region ../core/src/cauth.d.ts
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
    }: Omit<LoginSchemaType, "password"> & {
      password?: string;
      usePassword?: boolean;
      otpPurpose: OtpPurpose;
    }) => Promise<Result<{
      id: string;
      code: string;
    }>>;
    LoginWithOTP: (args: Omit<LoginSchemaType, "password"> & {
      code: string;
    }) => Promise<Result<{
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
//#endregion
//#region ../core/src/types/routes.contract.t.d.ts
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
//#region src/express.contractor.d.ts
type OptionalNextHandler = (req: Request, res: Response, next?: NextFunction) => any;
declare class ExpressContractor<THandler extends (...args: any[]) => any = OptionalNextHandler> implements RoutesContract<THandler> {
  Register: ({
    config,
    tokens
  }: RouteDeps) => THandler;
  Login: ({
    config,
    tokens
  }: RouteDeps) => THandler;
  Logout: ({
    config,
    tokens
  }: RouteDeps) => THandler;
  Refresh: ({
    config,
    tokens
  }: RouteDeps) => THandler;
  ChangePassword: ({
    config,
    tokens,
    userId
  }: RouteDeps & {
    userId: string;
  }) => THandler;
  Guard: ({
    config,
    tokens,
    roles
  }: AuthGuardDeps) => THandler;
}
//#endregion
export { ExpressContractor };