import ms from "ms";
import z$1, { z } from "zod";

//#region rolldown:runtime
//#endregion
//#region ../core/src/types/auth.t.d.ts
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
//#region ../core/src/types/helpers.t.d.ts
type LooseAutocomplete<T extends string> = T | Omit<string, T>;
//#endregion
//#region ../core/src/types/otp-purpose.t.d.ts
type OtpPurpose = LooseAutocomplete<'LOGIN' | 'RESET_PASSWORD' | 'ACTION'>;
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
type Result$2<T, E extends FNError = FNError> = {
  success: true;
  value: T;
} | {
  success: false;
  errors: E[];
};
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
  refreshToken: z.ZodJWT;
}, z.core.$strip>;
type RefreshTokenSchemaType = z.infer<typeof RefreshTokenSchema>;
declare const LogoutSchema: z.ZodObject<{
  refreshToken: z.ZodJWT;
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
declare class _CAuth<T extends string[]> {
  #private;
  constructor(config: Omit<CAuthOptions, 'roles'> & {
    roles: T;
  });
  get RoleType(): T[number];
  /**
   * @description Authentication Guard Middleware. Include 'roles' for a custom auth guard.
   *
   * If 'roles' is empty it allows all authenticated users, without respecting specific role
   *
   * @default undefined
   */
  Guard: (roles?: Array<T[number]>) => any;
  Routes: {
    Register: () => any;
    Login: () => any;
    Logout: () => any;
    Refresh: () => any;
    ChangePassword: (userId: string) => any;
  };
  FN: {
    Login: ({
      ...args
    }: LoginSchemaType) => Promise<Result$2<{
      account: Omit<AuthModel, "refreshTokens" | "passwordHash">;
      tokens: Awaited<ReturnType<_CAuth<any>>>;
    }>>;
    Register: ({
      ...args
    }: RegisterSchemaType) => Promise<Result<{
      account: Omit<AuthModel, "passwordHash" | "refreshTokens">;
      tokens: Awaited<ReturnType<_CAuth<any>>>;
    }>>;
    Logout: ({
      ...args
    }: LogoutSchemaType) => Promise<Result<unknown>>;
    Refresh: ({
      ...args
    }: RefreshTokenSchemaType) => Promise<Result$2<{
      account: Omit<AuthModel, "passwordHash" | "refreshTokens">;
      tokens: Awaited<ReturnType<_CAuth<any>["Tokens"]["GenerateTokenPairs"]>>;
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
    LoginWithOTP: ({
      ...args
    }: Omit<LoginSchemaType, "password"> & {
      code: string;
    }) => Promise<any>;
    VerifyOTP: ({
      ...args
    }: {
      id: string;
      code: string;
      otpPurpose: OtpPurpose;
    }) => Promise<{
      isValid: boolean;
    }>;
  };
  Tokens: {
    GenerateRefreshToken: (payload: any) => Promise<string>;
    GenerateAccessToken: (payload: any) => Promise<string>;
    GenerateTokenPairs: (payload: any) => Promise<{
      accessToken: string;
      refreshToken: string;
    }>;
    VerifyRefreshToken: <T_1>(token: any) => Promise<T_1 | null>;
    VerifyAccessToken: <T_1>(token: any) => Promise<T_1 | null>;
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
interface RoutesContract {
  Login({
    ...config
  }: RouteDeps): any;
  Register({
    ...config
  }: RouteDeps): any;
  Logout({
    ...config
  }: RouteDeps): any;
  Guard({
    ...config
  }: AuthGuardDeps): any;
  Refresh({
    ...config
  }: AuthGuardDeps): any;
  ChangePassword({
    ...config
  }: RouteDeps & {
    userId: string;
  }): any;
}
//#endregion
//#region ../core/src/types/config.t.d.ts
declare const CAuthOptionsSchema: z$1.ZodObject<{
  dbContractor: z$1.ZodCustom<DatabaseContract, DatabaseContract>;
  routeContractor: z$1.ZodCustom<RoutesContract, RoutesContract>;
  refreshTokenSecret: z$1.ZodString;
  accessTokenSecret: z$1.ZodString;
  roles: z$1.ZodArray<z$1.ZodString>;
  jwtConfig: z$1.ZodOptional<z$1.ZodObject<{
    accessTokenLifeSpan: z$1.ZodOptional<z$1.ZodCustom<ms.StringValue, ms.StringValue>>;
    refreshTokenLifeSpan: z$1.ZodOptional<z$1.ZodCustom<ms.StringValue, ms.StringValue>>;
  }, z$1.z.core.$strip>>;
  otpConfig: z$1.ZodObject<{
    expiresIn: z$1.ZodOptional<z$1.ZodNumber>;
    length: z$1.ZodOptional<z$1.ZodNumber>;
  }, z$1.z.core.$strip>;
}, z$1.z.core.$strip>;
type CAuthOptions = z$1.infer<typeof CAuthOptionsSchema>;
declare namespace library_d_exports {
  export { Action, Aggregate, AllModelsToStringIndex, ApplyOmit, Args, Args_3, BaseDMMF, Call, Cast, ClientArg, ClientArgs, ClientBuiltInProp, ClientOptionDef, ClientOtherOps, Compute, ComputeDeep, Count, DMMF, Debug, Decimal, DecimalJsLike, DefaultArgs, DefaultSelection, DevTypeMapDef, DevTypeMapFnDef, DynamicClientExtensionArgs, DynamicClientExtensionThis, DynamicClientExtensionThisBuiltin, DynamicModelExtensionArgs, DynamicModelExtensionFluentApi, DynamicModelExtensionFnResult, DynamicModelExtensionFnResultBase, DynamicModelExtensionFnResultNull, DynamicModelExtensionOperationFn, DynamicModelExtensionThis, DynamicQueryExtensionArgs, DynamicQueryExtensionCb, DynamicQueryExtensionCbArgs, DynamicQueryExtensionCbArgsArgs, DynamicResultExtensionArgs, DynamicResultExtensionData, DynamicResultExtensionNeeds, EmptyToUnknown, Equals, Exact, ExtendsHook, ExtensionArgs, Extensions, ExtractGlobalOmit, FieldRef$1 as FieldRef, Fn, GetAggregateResult, GetBatchResult, GetCountResult, GetFindResult, GetGroupByResult, GetOmit, GetPayloadResult, GetPayloadResultExtensionKeys, GetPayloadResultExtensionObject, GetPrismaClientConfig, GetResult, GetSelect, ITXClientDenyList, InputJsonArray, InputJsonObject, InputJsonValue, InternalArgs, JsArgs, JsInputValue, JsOutputValue, JsPromise, JsonArray, JsonBatchQuery, JsonConvertible, JsonObject, JsonQuery, JsonValue, MergeExtArgs, Metric, MetricHistogram, MetricHistogramBucket, Metrics, MetricsClient, ModelArg, ModelArgs, ModelKey, ModelQueryOptionsCb, ModelQueryOptionsCbArgs, NameArgs, Narrow, Narrowable, NeverToUnknown, ObjectEnumValue, Omission, Omit_2 as Omit, OmitValue, Operation, OperationPayload, Optional, OptionalFlat$1 as OptionalFlat, OptionalKeys, Or$1 as Or, Param, PatchFlat, Path, Payload, PayloadToResult, Pick_2 as Pick, PrismaClientInitializationError, PrismaClientKnownRequestError, PrismaClientOptions, PrismaClientRustPanicError, PrismaClientUnknownRequestError, PrismaClientValidationError, PrismaPromise, PrivateResultType, Public, QueryOptions, QueryOptionsCb, QueryOptionsCbArgs, RawParameters, RawQueryArgs, RawValue, ReadonlyDeep, Record_2 as Record, RenameAndNestPayloadKeys, RequiredExtensionArgs, RequiredKeys$1 as RequiredKeys, Result$1 as Result, ResultArg, ResultArgs, ResultArgsFieldCompute, ResultFieldDefinition, Result_2, Return, RuntimeDataModel, Select, SelectField, SelectablePayloadFields, Selection_2 as Selection, Sql, SqlDriverAdapterFactory, ToTuple, TypeMapCbDef, TypeMapDef, TypedSql, Types, UnknownTypedSql, UnwrapPayload, UnwrapPromise, UnwrapTuple, RequiredExtensionArgs as UserArgs, Value, createParam, defineDmmfProperty, deserializeJsonResponse, deserializeRawResult, dmmfToRuntimeDataModel, empty, getPrismaClient, getRuntime, isTypedSql, itxClientDenyList, join, makeStrictEnum, makeTypedQueryFactory, objectEnumValues, raw, serializeJsonQuery, skip, sqltag, warnEnvConflicts, warnOnce };
}
/**
 * @param this
 */
declare function $extends(this: Client, extension: ExtensionArgs | ((client: Client) => Client)): Client;
declare type AccelerateEngineConfig = {
  inlineSchema: EngineConfig['inlineSchema'];
  inlineSchemaHash: EngineConfig['inlineSchemaHash'];
  env: EngineConfig['env'];
  generator?: {
    previewFeatures: string[];
  };
  inlineDatasources: EngineConfig['inlineDatasources'];
  overrideDatasources: EngineConfig['overrideDatasources'];
  clientVersion: EngineConfig['clientVersion'];
  engineVersion: EngineConfig['engineVersion'];
  logEmitter: EngineConfig['logEmitter'];
  logQueries?: EngineConfig['logQueries'];
  logLevel?: EngineConfig['logLevel'];
  tracingHelper: EngineConfig['tracingHelper'];
  accelerateUtils?: AccelerateUtils;
};
declare type AccelerateUtils = EngineConfig['accelerateUtils'];
declare type Action = keyof typeof DMMF_2.ModelAction | 'executeRaw' | 'queryRaw' | 'runCommandRaw';
declare type ActiveConnectorType = Exclude<ConnectorType, 'postgres' | 'prisma+postgres'>;

/**
 * An interface that exposes some basic information about the
 * adapter like its name and provider type.
 */
declare interface AdapterInfo {
  readonly provider: Provider;
  readonly adapterName: (typeof officialPrismaAdapters)[number] | (string & {});
}
declare type Aggregate = '_count' | '_max' | '_min' | '_avg' | '_sum';
declare type AllModelsToStringIndex<TypeMap extends TypeMapDef, Args extends Record<string, any>, K extends PropertyKey> = Args extends { [P in K]: {
  $allModels: infer AllModels;
} } ? { [P in K]: Record<TypeMap['meta']['modelProps'], AllModels> } : {};
declare class AnyNull extends NullTypesEnumValue {
  #private;
}
declare type ApplyOmit<T, OmitConfig> = Compute<{ [K in keyof T as OmitValue<OmitConfig, K> extends true ? never : K]: T[K] }>;
declare type Args<T, F extends Operation> = T extends {
  [K: symbol]: {
    types: {
      operations: { [K in F]: {
        args: any;
      } };
    };
  };
} ? T[symbol]['types']['operations'][F]['args'] : any;
declare type Args_3<T, F extends Operation> = Args<T, F>;
/**
 * Original `quaint::ValueType` enum tag from Prisma's `quaint`.
 * Query arguments marked with this type are sanitized before being sent to the database.
 * Notice while a query argument may be `null`, `ArgType` is guaranteed to be defined.
 */
declare type ArgType = 'Int32' | 'Int64' | 'Float' | 'Double' | 'Text' | 'Enum' | 'EnumArray' | 'Bytes' | 'Boolean' | 'Char' | 'Array' | 'Numeric' | 'Json' | 'Xml' | 'Uuid' | 'DateTime' | 'Date' | 'Time' | 'Unknown';

/**
 * Attributes is a map from string to attribute values.
 *
 * Note: only the own enumerable keys are counted as valid attribute keys.
 */
declare interface Attributes {
  [attributeKey: string]: AttributeValue | undefined;
}

/**
 * Attribute values may be any non-nullish primitive value except an object.
 *
 * null or undefined attribute values are invalid and will result in undefined behavior.
 */
declare type AttributeValue = string | number | boolean | Array<null | undefined | string> | Array<null | undefined | number> | Array<null | undefined | boolean>;
declare type BaseDMMF = {
  readonly datamodel: Omit<DMMF_2.Datamodel, 'indexes'>;
};
declare type BatchArgs = {
  queries: BatchQuery[];
  transaction?: {
    isolationLevel?: IsolationLevel_2;
  };
};
declare type BatchInternalParams = {
  requests: RequestParams[];
  customDataProxyFetch?: CustomDataProxyFetch;
};
declare type BatchQuery = {
  model: string | undefined;
  operation: string;
  args: JsArgs | RawQueryArgs;
};
declare type BatchQueryEngineResult<T> = QueryEngineResultData<T> | Error;
declare type BatchQueryOptionsCb = (args: BatchQueryOptionsCbArgs) => Promise<any>;
declare type BatchQueryOptionsCbArgs = {
  args: BatchArgs;
  query: (args: BatchArgs, __internalParams?: BatchInternalParams) => Promise<unknown[]>;
  __internalParams: BatchInternalParams;
};
declare type BatchResponse = MultiBatchResponse | CompactedBatchResponse;
declare type BatchTransactionOptions = {
  isolationLevel?: Transaction_2.IsolationLevel;
};
declare interface BinaryTargetsEnvValue {
  fromEnvVar: string | null;
  value: string;
  native?: boolean;
}
declare type Call<F extends Fn, P> = (F & {
  params: P;
})['returns'];
declare interface CallSite {
  getLocation(): LocationInFile | null;
}
declare type Cast<A, W> = A extends W ? A : W;
declare type Client = ReturnType<typeof getPrismaClient> extends (new () => infer T) ? T : never;
declare type ClientArg = { [MethodName in string]: unknown };
declare type ClientArgs = {
  client: ClientArg;
};
declare type ClientBuiltInProp = keyof DynamicClientExtensionThisBuiltin<never, never, never>;
declare type ClientOptionDef = undefined | { [K in string]: any };
declare type ClientOtherOps = {
  $queryRaw<T = unknown>(query: TemplateStringsArray | Sql, ...values: any[]): PrismaPromise<T>;
  $queryRawTyped<T>(query: TypedSql<unknown[], T>): PrismaPromise<T[]>;
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): PrismaPromise<T>;
  $executeRaw(query: TemplateStringsArray | Sql, ...values: any[]): PrismaPromise<number>;
  $executeRawUnsafe(query: string, ...values: any[]): PrismaPromise<number>;
  $runCommandRaw(command: InputJsonObject): PrismaPromise<JsonObject>;
};
declare type ColumnType = (typeof ColumnTypeEnum)[keyof typeof ColumnTypeEnum];
declare const ColumnTypeEnum: {
  readonly Int32: 0;
  readonly Int64: 1;
  readonly Float: 2;
  readonly Double: 3;
  readonly Numeric: 4;
  readonly Boolean: 5;
  readonly Character: 6;
  readonly Text: 7;
  readonly Date: 8;
  readonly Time: 9;
  readonly DateTime: 10;
  readonly Json: 11;
  readonly Enum: 12;
  readonly Bytes: 13;
  readonly Set: 14;
  readonly Uuid: 15;
  readonly Int32Array: 64;
  readonly Int64Array: 65;
  readonly FloatArray: 66;
  readonly DoubleArray: 67;
  readonly NumericArray: 68;
  readonly BooleanArray: 69;
  readonly CharacterArray: 70;
  readonly TextArray: 71;
  readonly DateArray: 72;
  readonly TimeArray: 73;
  readonly DateTimeArray: 74;
  readonly JsonArray: 75;
  readonly EnumArray: 76;
  readonly BytesArray: 77;
  readonly UuidArray: 78;
  readonly UnknownNumber: 128;
};
declare type CompactedBatchResponse = {
  type: 'compacted';
  plan: {};
  arguments: Record<string, {}>[];
  nestedSelection: string[];
  keys: string[];
  expectNonEmpty: boolean;
};
declare type CompilerWasmLoadingConfig = {
  /**
   * WASM-bindgen runtime for corresponding module
   */
  getRuntime: () => Promise<{
    __wbg_set_wasm(exports: unknown): void;
    QueryCompiler: QueryCompilerConstructor;
  }>;
  /**
   * Loads the raw wasm module for the wasm compiler engine. This configuration is
   * generated specifically for each type of client, eg. Node.js client and Edge
   * clients will have different implementations.
   * @remarks this is a callback on purpose, we only load the wasm if needed.
   * @remarks only used by ClientEngine
   */
  getQueryCompilerWasmModule: () => Promise<unknown>;
};
declare type Compute<T> = T extends Function ? T : { [K in keyof T]: T[K] } & unknown;
declare type ComputeDeep<T> = T extends Function ? T : { [K in keyof T]: ComputeDeep<T[K]> } & unknown;
declare type ComputedField = {
  name: string;
  needs: string[];
  compute: ResultArgsFieldCompute;
};
declare type ComputedFieldsMap = {
  [fieldName: string]: ComputedField;
};
declare type ConnectionInfo = {
  schemaName?: string;
  maxBindValues?: number;
  supportsRelationJoins: boolean;
};
declare type ConnectorType = 'mysql' | 'mongodb' | 'sqlite' | 'postgresql' | 'postgres' | 'prisma+postgres' | 'sqlserver' | 'cockroachdb';
declare interface Context {
  /**
   * Get a value from the context.
   *
   * @param key key which identifies a context value
   */
  getValue(key: symbol): unknown;
  /**
   * Create a new context which inherits from this context and has
   * the given key set to the given value.
   *
   * @param key context key for which to set the value
   * @param value value to set for the given key
   */
  setValue(key: symbol, value: unknown): Context;
  /**
   * Return a new context which inherits from this context but does
   * not contain a value for the given key.
   *
   * @param key context key for which to clear a value
   */
  deleteValue(key: symbol): Context;
}
declare type Context_2<T> = T extends {
  [K: symbol]: {
    ctx: infer C;
  };
} ? C & T & {
  /**
   * @deprecated Use `$name` instead.
   */
  name?: string;
  $name?: string;
  $parent?: unknown;
} : T & {
  /**
   * @deprecated Use `$name` instead.
   */
  name?: string;
  $name?: string;
  $parent?: unknown;
};
declare type Count<O> = { [K in keyof O]: Count<number> } & {};
declare function createParam(name: string): Param<unknown, string>;
/**
 * Custom fetch function for `DataProxyEngine`.
 *
 * We can't use the actual type of `globalThis.fetch` because this will result
 * in API Extractor referencing Node.js type definitions in the `.d.ts` bundle
 * for the client runtime. We can only use such types in internal types that
 * don't end up exported anywhere.

 * It's also not possible to write a definition of `fetch` that would accept the
 * actual `fetch` function from different environments such as Node.js and
 * Cloudflare Workers (with their extensions to `RequestInit` and `Response`).
 * `fetch` is used in both covariant and contravariant positions in
 * `CustomDataProxyFetch`, making it invariant, so we need the exact same type.
 * Even if we removed the argument and left `fetch` in covariant position only,
 * then for an extension-supplied function to be assignable to `customDataProxyFetch`,
 * the platform-specific (or custom) `fetch` function needs to be assignable
 * to our `fetch` definition. This, in turn, requires the third-party `Response`
 * to be a subtype of our `Response` (which is not a problem, we could declare
 * a minimal `Response` type that only includes what we use) *and* requires the
 * third-party `RequestInit` to be a supertype of our `RequestInit` (i.e. we
 * have to declare all properties any `RequestInit` implementation in existence
 * could possibly have), which is not possible.
 *
 * Since `@prisma/extension-accelerate` redefines the type of
 * `__internalParams.customDataProxyFetch` to its own type anyway (probably for
 * exactly this reason), our definition is never actually used and is completely
 * ignored, so it doesn't matter, and we can just use `unknown` as the type of
 * `fetch` here.
 */
declare type CustomDataProxyFetch = (fetch: unknown) => unknown;
declare class DataLoader<T = unknown> {
  private options;
  batches: {
    [key: string]: Job[];
  };
  private tickActive;
  constructor(options: DataLoaderOptions<T>);
  request(request: T): Promise<any>;
  private dispatchBatches;
  get [Symbol.toStringTag](): string;
}
declare type DataLoaderOptions<T> = {
  singleLoader: (request: T) => Promise<any>;
  batchLoader: (request: T[]) => Promise<any[]>;
  batchBy: (request: T) => string | undefined;
  batchOrder: (requestA: T, requestB: T) => number;
};
declare type Datamodel = ReadonlyDeep_2<{
  models: Model$1[];
  enums: DatamodelEnum[];
  types: Model$1[];
  indexes: Index[];
}>;
declare type DatamodelEnum = ReadonlyDeep_2<{
  name: string;
  values: EnumValue[];
  dbName?: string | null;
  documentation?: string;
}>;
declare function datamodelEnumToSchemaEnum(datamodelEnum: DatamodelEnum): SchemaEnum;
declare type Datasource$1 = {
  url?: string;
};
declare type Datasources$1 = { [name in string]: Datasource$1 };
declare class DbNull extends NullTypesEnumValue {
  #private;
}
declare const Debug: typeof debugCreate & {
  enable(namespace: any): void;
  disable(): any;
  enabled(namespace: string): boolean;
  log: (...args: string[]) => void;
  formatters: {};
};
/**
 * Create a new debug instance with the given namespace.
 *
 * @example
 * ```ts
 * import Debug from '@prisma/debug'
 * const debug = Debug('prisma:client')
 * debug('Hello World')
 * ```
 */
declare function debugCreate(namespace: string): ((...args: any[]) => void) & {
  color: string;
  enabled: boolean;
  namespace: string;
  log: (...args: string[]) => void;
  extend: () => void;
};
declare function Decimal(n: Decimal.Value): Decimal;
declare namespace Decimal {
  export type Constructor = typeof Decimal;
  export type Instance = Decimal;
  export type Rounding = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  export type Modulo = Rounding | 9;
  export type Value = string | number | Decimal;

  // http://mikemcl.github.io/decimal.js/#constructor-properties
  export interface Config {
    precision?: number;
    rounding?: Rounding;
    toExpNeg?: number;
    toExpPos?: number;
    minE?: number;
    maxE?: number;
    crypto?: boolean;
    modulo?: Modulo;
    defaults?: boolean;
  }
}
declare class Decimal {
  readonly d: number[];
  readonly e: number;
  readonly s: number;
  constructor(n: Decimal.Value);
  absoluteValue(): Decimal;
  abs(): Decimal;
  ceil(): Decimal;
  clampedTo(min: Decimal.Value, max: Decimal.Value): Decimal;
  clamp(min: Decimal.Value, max: Decimal.Value): Decimal;
  comparedTo(n: Decimal.Value): number;
  cmp(n: Decimal.Value): number;
  cosine(): Decimal;
  cos(): Decimal;
  cubeRoot(): Decimal;
  cbrt(): Decimal;
  decimalPlaces(): number;
  dp(): number;
  dividedBy(n: Decimal.Value): Decimal;
  div(n: Decimal.Value): Decimal;
  dividedToIntegerBy(n: Decimal.Value): Decimal;
  divToInt(n: Decimal.Value): Decimal;
  equals(n: Decimal.Value): boolean;
  eq(n: Decimal.Value): boolean;
  floor(): Decimal;
  greaterThan(n: Decimal.Value): boolean;
  gt(n: Decimal.Value): boolean;
  greaterThanOrEqualTo(n: Decimal.Value): boolean;
  gte(n: Decimal.Value): boolean;
  hyperbolicCosine(): Decimal;
  cosh(): Decimal;
  hyperbolicSine(): Decimal;
  sinh(): Decimal;
  hyperbolicTangent(): Decimal;
  tanh(): Decimal;
  inverseCosine(): Decimal;
  acos(): Decimal;
  inverseHyperbolicCosine(): Decimal;
  acosh(): Decimal;
  inverseHyperbolicSine(): Decimal;
  asinh(): Decimal;
  inverseHyperbolicTangent(): Decimal;
  atanh(): Decimal;
  inverseSine(): Decimal;
  asin(): Decimal;
  inverseTangent(): Decimal;
  atan(): Decimal;
  isFinite(): boolean;
  isInteger(): boolean;
  isInt(): boolean;
  isNaN(): boolean;
  isNegative(): boolean;
  isNeg(): boolean;
  isPositive(): boolean;
  isPos(): boolean;
  isZero(): boolean;
  lessThan(n: Decimal.Value): boolean;
  lt(n: Decimal.Value): boolean;
  lessThanOrEqualTo(n: Decimal.Value): boolean;
  lte(n: Decimal.Value): boolean;
  logarithm(n?: Decimal.Value): Decimal;
  log(n?: Decimal.Value): Decimal;
  minus(n: Decimal.Value): Decimal;
  sub(n: Decimal.Value): Decimal;
  modulo(n: Decimal.Value): Decimal;
  mod(n: Decimal.Value): Decimal;
  naturalExponential(): Decimal;
  exp(): Decimal;
  naturalLogarithm(): Decimal;
  ln(): Decimal;
  negated(): Decimal;
  neg(): Decimal;
  plus(n: Decimal.Value): Decimal;
  add(n: Decimal.Value): Decimal;
  precision(includeZeros?: boolean): number;
  sd(includeZeros?: boolean): number;
  round(): Decimal;
  sine(): Decimal;
  sin(): Decimal;
  squareRoot(): Decimal;
  sqrt(): Decimal;
  tangent(): Decimal;
  tan(): Decimal;
  times(n: Decimal.Value): Decimal;
  mul(n: Decimal.Value): Decimal;
  toBinary(significantDigits?: number): string;
  toBinary(significantDigits: number, rounding: Decimal.Rounding): string;
  toDecimalPlaces(decimalPlaces?: number): Decimal;
  toDecimalPlaces(decimalPlaces: number, rounding: Decimal.Rounding): Decimal;
  toDP(decimalPlaces?: number): Decimal;
  toDP(decimalPlaces: number, rounding: Decimal.Rounding): Decimal;
  toExponential(decimalPlaces?: number): string;
  toExponential(decimalPlaces: number, rounding: Decimal.Rounding): string;
  toFixed(decimalPlaces?: number): string;
  toFixed(decimalPlaces: number, rounding: Decimal.Rounding): string;
  toFraction(max_denominator?: Decimal.Value): Decimal[];
  toHexadecimal(significantDigits?: number): string;
  toHexadecimal(significantDigits: number, rounding: Decimal.Rounding): string;
  toHex(significantDigits?: number): string;
  toHex(significantDigits: number, rounding?: Decimal.Rounding): string;
  toJSON(): string;
  toNearest(n: Decimal.Value, rounding?: Decimal.Rounding): Decimal;
  toNumber(): number;
  toOctal(significantDigits?: number): string;
  toOctal(significantDigits: number, rounding: Decimal.Rounding): string;
  toPower(n: Decimal.Value): Decimal;
  pow(n: Decimal.Value): Decimal;
  toPrecision(significantDigits?: number): string;
  toPrecision(significantDigits: number, rounding: Decimal.Rounding): string;
  toSignificantDigits(significantDigits?: number): Decimal;
  toSignificantDigits(significantDigits: number, rounding: Decimal.Rounding): Decimal;
  toSD(significantDigits?: number): Decimal;
  toSD(significantDigits: number, rounding: Decimal.Rounding): Decimal;
  toString(): string;
  truncated(): Decimal;
  trunc(): Decimal;
  valueOf(): string;
  static abs(n: Decimal.Value): Decimal;
  static acos(n: Decimal.Value): Decimal;
  static acosh(n: Decimal.Value): Decimal;
  static add(x: Decimal.Value, y: Decimal.Value): Decimal;
  static asin(n: Decimal.Value): Decimal;
  static asinh(n: Decimal.Value): Decimal;
  static atan(n: Decimal.Value): Decimal;
  static atanh(n: Decimal.Value): Decimal;
  static atan2(y: Decimal.Value, x: Decimal.Value): Decimal;
  static cbrt(n: Decimal.Value): Decimal;
  static ceil(n: Decimal.Value): Decimal;
  static clamp(n: Decimal.Value, min: Decimal.Value, max: Decimal.Value): Decimal;
  static clone(object?: Decimal.Config): Decimal.Constructor;
  static config(object: Decimal.Config): Decimal.Constructor;
  static cos(n: Decimal.Value): Decimal;
  static cosh(n: Decimal.Value): Decimal;
  static div(x: Decimal.Value, y: Decimal.Value): Decimal;
  static exp(n: Decimal.Value): Decimal;
  static floor(n: Decimal.Value): Decimal;
  static hypot(...n: Decimal.Value[]): Decimal;
  static isDecimal(object: any): object is Decimal;
  static ln(n: Decimal.Value): Decimal;
  static log(n: Decimal.Value, base?: Decimal.Value): Decimal;
  static log2(n: Decimal.Value): Decimal;
  static log10(n: Decimal.Value): Decimal;
  static max(...n: Decimal.Value[]): Decimal;
  static min(...n: Decimal.Value[]): Decimal;
  static mod(x: Decimal.Value, y: Decimal.Value): Decimal;
  static mul(x: Decimal.Value, y: Decimal.Value): Decimal;
  static noConflict(): Decimal.Constructor; // Browser only
  static pow(base: Decimal.Value, exponent: Decimal.Value): Decimal;
  static random(significantDigits?: number): Decimal;
  static round(n: Decimal.Value): Decimal;
  static set(object: Decimal.Config): Decimal.Constructor;
  static sign(n: Decimal.Value): number;
  static sin(n: Decimal.Value): Decimal;
  static sinh(n: Decimal.Value): Decimal;
  static sqrt(n: Decimal.Value): Decimal;
  static sub(x: Decimal.Value, y: Decimal.Value): Decimal;
  static sum(...n: Decimal.Value[]): Decimal;
  static tan(n: Decimal.Value): Decimal;
  static tanh(n: Decimal.Value): Decimal;
  static trunc(n: Decimal.Value): Decimal;
  static readonly default?: Decimal.Constructor;
  static readonly Decimal?: Decimal.Constructor;
  static readonly precision: number;
  static readonly rounding: Decimal.Rounding;
  static readonly toExpNeg: number;
  static readonly toExpPos: number;
  static readonly minE: number;
  static readonly maxE: number;
  static readonly crypto: boolean;
  static readonly modulo: Decimal.Modulo;
  static readonly ROUND_UP: 0;
  static readonly ROUND_DOWN: 1;
  static readonly ROUND_CEIL: 2;
  static readonly ROUND_FLOOR: 3;
  static readonly ROUND_HALF_UP: 4;
  static readonly ROUND_HALF_DOWN: 5;
  static readonly ROUND_HALF_EVEN: 6;
  static readonly ROUND_HALF_CEIL: 7;
  static readonly ROUND_HALF_FLOOR: 8;
  static readonly EUCLID: 9;
}
/**
 * Interface for any Decimal.js-like library
 * Allows us to accept Decimal.js from different
 * versions and some compatible alternatives
 */
declare interface DecimalJsLike {
  d: number[];
  e: number;
  s: number;
  toFixed(): string;
}
declare type DefaultArgs = InternalArgs<{}, {}, {}, {}>;
declare type DefaultSelection<Payload extends OperationPayload, Args = {}, GlobalOmitOptions = {}> = Args extends {
  omit: infer LocalOmit;
} ? ApplyOmit<UnwrapPayload<{
  default: Payload;
}>['default'], PatchFlat<LocalOmit, ExtractGlobalOmit<GlobalOmitOptions$1, Uncapitalize<Payload['name']>>>> : ApplyOmit<UnwrapPayload<{
  default: Payload;
}>['default'], ExtractGlobalOmit<GlobalOmitOptions$1, Uncapitalize<Payload['name']>>>;
declare function defineDmmfProperty(target: object, runtimeDataModel: RuntimeDataModel): void;
declare function defineExtension(ext: ExtensionArgs | ((client: Client) => Client)): (client: Client) => Client;
declare const denylist: readonly ["$connect", "$disconnect", "$on", "$transaction", "$use", "$extends"];
declare type Deprecation = ReadonlyDeep_2<{
  sinceVersion: string;
  reason: string;
  plannedRemovalVersion?: string;
}>;
declare type DeserializedResponse = Array<Record<string, unknown>>;
declare function deserializeJsonResponse(result: unknown): unknown;
declare function deserializeRawResult(response: RawResponse): DeserializedResponse;
declare type DevTypeMapDef = {
  meta: {
    modelProps: string;
  };
  model: { [Model in PropertyKey]: { [Operation in PropertyKey]: DevTypeMapFnDef } };
  other: { [Operation in PropertyKey]: DevTypeMapFnDef };
};
declare type DevTypeMapFnDef = {
  args: any;
  result: any;
  payload: OperationPayload;
};
declare namespace DMMF {
  export { datamodelEnumToSchemaEnum, Document_2 as Document, Mappings, OtherOperationMappings, DatamodelEnum, SchemaEnum, EnumValue, Datamodel, uniqueIndex, PrimaryKey, Model$1 as Model, FieldKind, FieldNamespace, FieldLocation, Field, FieldDefault, FieldDefaultScalar, Index, IndexType, IndexField, SortOrder, Schema, Query, QueryOutput, TypeRef, InputTypeRef, SchemaArg, OutputType, SchemaField, OutputTypeRef, Deprecation, InputType, FieldRefType, FieldRefAllowType, ModelMapping, ModelAction };
}
declare namespace DMMF_2 {
  export { datamodelEnumToSchemaEnum, Document_2 as Document, Mappings, OtherOperationMappings, DatamodelEnum, SchemaEnum, EnumValue, Datamodel, uniqueIndex, PrimaryKey, Model$1 as Model, FieldKind, FieldNamespace, FieldLocation, Field, FieldDefault, FieldDefaultScalar, Index, IndexType, IndexField, SortOrder, Schema, Query, QueryOutput, TypeRef, InputTypeRef, SchemaArg, OutputType, SchemaField, OutputTypeRef, Deprecation, InputType, FieldRefType, FieldRefAllowType, ModelMapping, ModelAction };
}
declare function dmmfToRuntimeDataModel(dmmfDataModel: DMMF_2.Datamodel): RuntimeDataModel;
declare type Document_2 = ReadonlyDeep_2<{
  datamodel: Datamodel;
  schema: Schema;
  mappings: Mappings;
}>;

/**
 * A generic driver adapter factory that allows the user to instantiate a
 * driver adapter. The query and result types are specific to the adapter.
 */
declare interface DriverAdapterFactory<Query, Result> extends AdapterInfo {
  /**
   * Instantiate a driver adapter.
   */
  connect(): Promise<Queryable<Query, Result$1>>;
}

/** Client */
declare type DynamicClientExtensionArgs<C_, TypeMap extends TypeMapDef, TypeMapCb extends TypeMapCbDef, ExtArgs extends Record<string, any>> = { [P in keyof C_]: unknown } & {
  [K: symbol]: {
    ctx: Optional<DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs>, ITXClientDenyList> & {
      $parent: Optional<DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs>, ITXClientDenyList>;
    };
  };
};
declare type DynamicClientExtensionThis<TypeMap extends TypeMapDef, TypeMapCb extends TypeMapCbDef, ExtArgs extends Record<string, any>> = { [P in keyof ExtArgs['client']]: Return<ExtArgs['client'][P]> } & { [P in Exclude<TypeMap['meta']['modelProps'], keyof ExtArgs['client']>]: DynamicModelExtensionThis<TypeMap, ModelKey<TypeMap, P>, ExtArgs> } & { [P in Exclude<keyof TypeMap['other']['operations'], keyof ExtArgs['client']>]: P extends keyof ClientOtherOps ? ClientOtherOps[P] : never } & { [P in Exclude<ClientBuiltInProp, keyof ExtArgs['client']>]: DynamicClientExtensionThisBuiltin<TypeMap, TypeMapCb, ExtArgs>[P] } & {
  [K: symbol]: {
    types: TypeMap['other'];
  };
};
declare type DynamicClientExtensionThisBuiltin<TypeMap extends TypeMapDef, TypeMapCb extends TypeMapCbDef, ExtArgs extends Record<string, any>> = {
  $extends: ExtendsHook<'extends', TypeMapCb, ExtArgs, Call<TypeMapCb, {
    extArgs: ExtArgs;
  }>>;
  $transaction<P extends PrismaPromise<any>[]>(arg: [...P], options?: {
    isolationLevel?: TypeMap['meta']['txIsolationLevel'];
  }): Promise<UnwrapTuple<P>>;
  $transaction<R>(fn: (client: Omit<DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs>, ITXClientDenyList>) => Promise<R>, options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: TypeMap['meta']['txIsolationLevel'];
  }): Promise<R>;
  $disconnect(): Promise<void>;
  $connect(): Promise<void>;
};
/** Model */
declare type DynamicModelExtensionArgs<M_, TypeMap extends TypeMapDef, TypeMapCb extends TypeMapCbDef, ExtArgs extends Record<string, any>> = { [K in keyof M_]: K extends '$allModels' ? { [P in keyof M_[K]]?: unknown } & {
  [K: symbol]: {};
} : K extends TypeMap['meta']['modelProps'] ? { [P in keyof M_[K]]?: unknown } & {
  [K: symbol]: {
    ctx: DynamicModelExtensionThis<TypeMap, ModelKey<TypeMap, K>, ExtArgs> & {
      $parent: DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs>;
    } & {
      $name: ModelKey<TypeMap, K>;
    } & {
      /**
       * @deprecated Use `$name` instead.
       */
      name: ModelKey<TypeMap, K>;
    };
  };
} : never };
declare type DynamicModelExtensionFluentApi<TypeMap extends TypeMapDef, M extends PropertyKey, P extends PropertyKey, Null> = { [K in keyof TypeMap['model'][M]['payload']['objects']]: <A>(args?: Exact<A, Path<TypeMap['model'][M]['operations'][P]['args']['select'], [K]>>) => PrismaPromise<Path<DynamicModelExtensionFnResultBase<TypeMap, M, {
  select: { [P in K]: A };
}, P>, [K]> | Null> & DynamicModelExtensionFluentApi<TypeMap, (TypeMap['model'][M]['payload']['objects'][K] & {})['name'], P, Null | Select<TypeMap['model'][M]['payload']['objects'][K], null>> };
declare type DynamicModelExtensionFnResult<TypeMap extends TypeMapDef, M extends PropertyKey, A, P extends PropertyKey, Null> = P extends FluentOperation ? DynamicModelExtensionFluentApi<TypeMap, M, P, Null> & PrismaPromise<DynamicModelExtensionFnResultBase<TypeMap, M, A, P> | Null> : PrismaPromise<DynamicModelExtensionFnResultBase<TypeMap, M, A, P>>;
declare type DynamicModelExtensionFnResultBase<TypeMap extends TypeMapDef, M extends PropertyKey, A, P extends PropertyKey> = GetResult<TypeMap['model'][M]['payload'], A, P & Operation, TypeMap['globalOmitOptions']>;
declare type DynamicModelExtensionFnResultNull<P extends PropertyKey> = P extends 'findUnique' | 'findFirst' ? null : never;
declare type DynamicModelExtensionOperationFn<TypeMap extends TypeMapDef, M extends PropertyKey, P extends PropertyKey> = {} extends TypeMap['model'][M]['operations'][P]['args'] ? <A extends TypeMap['model'][M]['operations'][P]['args']>(args?: Exact<A, TypeMap['model'][M]['operations'][P]['args']>) => DynamicModelExtensionFnResult<TypeMap, M, A, P, DynamicModelExtensionFnResultNull<P>> : <A extends TypeMap['model'][M]['operations'][P]['args']>(args: Exact<A, TypeMap['model'][M]['operations'][P]['args']>) => DynamicModelExtensionFnResult<TypeMap, M, A, P, DynamicModelExtensionFnResultNull<P>>;
declare type DynamicModelExtensionThis<TypeMap extends TypeMapDef, M extends PropertyKey, ExtArgs extends Record<string, any>> = { [P in keyof ExtArgs['model'][Uncapitalize<M & string>]]: Return<ExtArgs['model'][Uncapitalize<M & string>][P]> } & { [P in Exclude<keyof TypeMap['model'][M]['operations'], keyof ExtArgs['model'][Uncapitalize<M & string>]>]: DynamicModelExtensionOperationFn<TypeMap, M, P> } & { [P in Exclude<'fields', keyof ExtArgs['model'][Uncapitalize<M & string>]>]: TypeMap['model'][M]['fields'] } & {
  [K: symbol]: {
    types: TypeMap['model'][M];
  };
};
/** Query */
declare type DynamicQueryExtensionArgs<Q_, TypeMap extends TypeMapDef> = { [K in keyof Q_]: K extends '$allOperations' ? (args: {
  model?: string;
  operation: string;
  args: any;
  query: (args: any) => PrismaPromise<any>;
}) => Promise<any> : K extends '$allModels' ? { [P in keyof Q_[K] | keyof TypeMap['model'][keyof TypeMap['model']]['operations'] | '$allOperations']?: P extends '$allOperations' ? DynamicQueryExtensionCb<TypeMap, 'model', keyof TypeMap['model'], keyof TypeMap['model'][keyof TypeMap['model']]['operations']> : P extends keyof TypeMap['model'][keyof TypeMap['model']]['operations'] ? DynamicQueryExtensionCb<TypeMap, 'model', keyof TypeMap['model'], P> : never } : K extends TypeMap['meta']['modelProps'] ? { [P in keyof Q_[K] | keyof TypeMap['model'][ModelKey<TypeMap, K>]['operations'] | '$allOperations']?: P extends '$allOperations' ? DynamicQueryExtensionCb<TypeMap, 'model', ModelKey<TypeMap, K>, keyof TypeMap['model'][ModelKey<TypeMap, K>]['operations']> : P extends keyof TypeMap['model'][ModelKey<TypeMap, K>]['operations'] ? DynamicQueryExtensionCb<TypeMap, 'model', ModelKey<TypeMap, K>, P> : never } : K extends keyof TypeMap['other']['operations'] ? DynamicQueryExtensionCb<[TypeMap], 0, 'other', K> : never };
declare type DynamicQueryExtensionCb<TypeMap extends TypeMapDef, _0 extends PropertyKey, _1 extends PropertyKey, _2 extends PropertyKey> = <A extends DynamicQueryExtensionCbArgs<TypeMap, _0, _1, _2>>(args: A) => Promise<TypeMap[_0][_1][_2]['result']>;
declare type DynamicQueryExtensionCbArgs<TypeMap extends TypeMapDef, _0 extends PropertyKey, _1 extends PropertyKey, _2 extends PropertyKey> = (_1 extends unknown ? _2 extends unknown ? {
  args: DynamicQueryExtensionCbArgsArgs<TypeMap, _0, _1, _2>;
  model: _0 extends 0 ? undefined : _1;
  operation: _2;
  query: <A extends DynamicQueryExtensionCbArgsArgs<TypeMap, _0, _1, _2>>(args: A) => PrismaPromise<TypeMap[_0][_1]['operations'][_2]['result']>;
} : never : never) & {
  query: (args: DynamicQueryExtensionCbArgsArgs<TypeMap, _0, _1, _2>) => PrismaPromise<TypeMap[_0][_1]['operations'][_2]['result']>;
};
declare type DynamicQueryExtensionCbArgsArgs<TypeMap extends TypeMapDef, _0 extends PropertyKey, _1 extends PropertyKey, _2 extends PropertyKey> = _2 extends '$queryRaw' | '$executeRaw' ? Sql : TypeMap[_0][_1]['operations'][_2]['args'];
/** Result */
declare type DynamicResultExtensionArgs<R_, TypeMap extends TypeMapDef> = { [K in keyof R_]: { [P in keyof R_[K]]?: {
  needs?: DynamicResultExtensionNeeds<TypeMap, ModelKey<TypeMap, K>, R_[K][P]>;
  compute(data: DynamicResultExtensionData<TypeMap, ModelKey<TypeMap, K>, R_[K][P]>): any;
} } };
declare type DynamicResultExtensionData<TypeMap extends TypeMapDef, M extends PropertyKey, S> = GetFindResult<TypeMap['model'][M]['payload'], {
  select: S;
}, {}>;
declare type DynamicResultExtensionNeeds<TypeMap extends TypeMapDef, M extends PropertyKey, S> = { [K in keyof S]: K extends keyof TypeMap['model'][M]['payload']['scalars'] ? S[K] : never } & { [N in keyof TypeMap['model'][M]['payload']['scalars']]?: boolean };
/**
 * Placeholder value for "no text".
 */
declare const empty: Sql;
declare type EmptyToUnknown<T> = T;
declare interface Engine<InteractiveTransactionPayload = unknown> {
  /** The name of the engine. This is meant to be consumed externally */
  readonly name: string;
  onBeforeExit(callback: () => Promise<void>): void;
  start(): Promise<void>;
  stop(): Promise<void>;
  version(forceRun?: boolean): Promise<string> | string;
  request<T>(query: JsonQuery, options: RequestOptions<InteractiveTransactionPayload>): Promise<QueryEngineResultData<T>>;
  requestBatch<T>(queries: JsonQuery[], options: RequestBatchOptions<InteractiveTransactionPayload>): Promise<BatchQueryEngineResult<T>[]>;
  transaction(action: 'start', headers: Transaction_2.TransactionHeaders, options: Transaction_2.Options): Promise<Transaction_2.InteractiveTransactionInfo<unknown>>;
  transaction(action: 'commit', headers: Transaction_2.TransactionHeaders, info: Transaction_2.InteractiveTransactionInfo<unknown>): Promise<void>;
  transaction(action: 'rollback', headers: Transaction_2.TransactionHeaders, info: Transaction_2.InteractiveTransactionInfo<unknown>): Promise<void>;
  metrics(options: MetricsOptionsJson): Promise<Metrics>;
  metrics(options: MetricsOptionsPrometheus): Promise<string>;
  applyPendingMigrations(): Promise<void>;
}
declare interface EngineConfig {
  cwd: string;
  dirname: string;
  enableDebugLogs?: boolean;
  allowTriggerPanic?: boolean;
  prismaPath?: string;
  generator?: GeneratorConfig;
  /**
   * @remarks this field is used internally by Policy, do not rename or remove
   */
  overrideDatasources: Datasources$1;
  showColors?: boolean;
  logQueries?: boolean;
  logLevel?: 'info' | 'warn';
  env: Record<string, string>;
  flags?: string[];
  clientVersion: string;
  engineVersion: string;
  previewFeatures?: string[];
  engineEndpoint?: string;
  activeProvider?: string;
  logEmitter: LogEmitter;
  transactionOptions: Transaction_2.Options;
  /**
   * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`.
   * If set, this is only used in the library engine, and all queries would be performed through it,
   * rather than Prisma's Rust drivers.
   * @remarks only used by LibraryEngine.ts
   */
  adapter?: SqlDriverAdapterFactory;
  /**
   * The contents of the schema encoded into a string
   */
  inlineSchema: string;
  /**
   * The contents of the datasource url saved in a string
   * @remarks only used by DataProxyEngine.ts
   * @remarks this field is used internally by Policy, do not rename or remove
   */
  inlineDatasources: GetPrismaClientConfig['inlineDatasources'];
  /**
   * The string hash that was produced for a given schema
   * @remarks only used by DataProxyEngine.ts
   */
  inlineSchemaHash: string;
  /**
   * The helper for interaction with OTEL tracing
   * @remarks enabling is determined by the client and @prisma/instrumentation package
   */
  tracingHelper: TracingHelper;
  /**
   * Information about whether we have not found a schema.prisma file in the
   * default location, and that we fell back to finding the schema.prisma file
   * in the current working directory. This usually means it has been bundled.
   */
  isBundled?: boolean;
  /**
   * Web Assembly module loading configuration
   */
  engineWasm?: EngineWasmLoadingConfig;
  compilerWasm?: CompilerWasmLoadingConfig;
  /**
   * Allows Accelerate to use runtime utilities from the client. These are
   * necessary for the AccelerateEngine to function correctly.
   */
  accelerateUtils?: {
    resolveDatasourceUrl: typeof resolveDatasourceUrl;
    getBatchRequestPayload: typeof getBatchRequestPayload;
    prismaGraphQLToJSError: typeof prismaGraphQLToJSError;
    PrismaClientUnknownRequestError: typeof PrismaClientUnknownRequestError;
    PrismaClientInitializationError: typeof PrismaClientInitializationError;
    PrismaClientKnownRequestError: typeof PrismaClientKnownRequestError;
    debug: (...args: any[]) => void;
    engineVersion: string;
    clientVersion: string;
  };
}
declare type EngineEvent<E extends EngineEventType> = E extends QueryEventType ? QueryEvent : LogEvent;
declare type EngineEventType = QueryEventType | LogEventType;
declare type EngineSpan = {
  id: EngineSpanId;
  parentId: string | null;
  name: string;
  startTime: HrTime;
  endTime: HrTime;
  kind: EngineSpanKind;
  attributes?: Record<string, unknown>;
  links?: EngineSpanId[];
};
declare type EngineSpanId = string;
declare type EngineSpanKind = 'client' | 'internal';
declare type EngineWasmLoadingConfig = {
  /**
   * WASM-bindgen runtime for corresponding module
   */
  getRuntime: () => Promise<{
    __wbg_set_wasm(exports: unknown): void;
    QueryEngine: QueryEngineConstructor;
  }>;
  /**
   * Loads the raw wasm module for the wasm query engine. This configuration is
   * generated specifically for each type of client, eg. Node.js client and Edge
   * clients will have different implementations.
   * @remarks this is a callback on purpose, we only load the wasm if needed.
   * @remarks only used by LibraryEngine
   */
  getQueryEngineWasmModule: () => Promise<unknown>;
};
declare type EnumValue = ReadonlyDeep_2<{
  name: string;
  dbName: string | null;
}>;
declare type EnvPaths = {
  rootEnvPath: string | null;
  schemaEnvPath: string | undefined;
};
declare interface EnvValue {
  fromEnvVar: null | string;
  value: null | string;
}
declare type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? 1 : 0;
declare type Error_2 = {
  kind: 'GenericJs';
  id: number;
} | {
  kind: 'UnsupportedNativeDataType';
  type: string;
} | {
  kind: 'InvalidIsolationLevel';
  level: string;
} | {
  kind: 'LengthMismatch';
  column?: string;
} | {
  kind: 'UniqueConstraintViolation';
  constraint?: {
    fields: string[];
  } | {
    index: string;
  } | {
    foreignKey: {};
  };
} | {
  kind: 'NullConstraintViolation';
  constraint?: {
    fields: string[];
  } | {
    index: string;
  } | {
    foreignKey: {};
  };
} | {
  kind: 'ForeignKeyConstraintViolation';
  constraint?: {
    fields: string[];
  } | {
    index: string;
  } | {
    foreignKey: {};
  };
} | {
  kind: 'DatabaseDoesNotExist';
  db?: string;
} | {
  kind: 'DatabaseAlreadyExists';
  db?: string;
} | {
  kind: 'DatabaseAccessDenied';
  db?: string;
} | {
  kind: 'AuthenticationFailed';
  user?: string;
} | {
  kind: 'TransactionWriteConflict';
} | {
  kind: 'TableDoesNotExist';
  table?: string;
} | {
  kind: 'ColumnNotFound';
  column?: string;
} | {
  kind: 'TooManyConnections';
  cause: string;
} | {
  kind: 'ValueOutOfRange';
  cause: string;
} | {
  kind: 'MissingFullTextSearchIndex';
} | {
  kind: 'SocketTimeout';
} | {
  kind: 'InconsistentColumnData';
  cause: string;
} | {
  kind: 'TransactionAlreadyClosed';
  cause: string;
} | {
  kind: 'postgres';
  code: string;
  severity: string;
  message: string;
  detail: string | undefined;
  column: string | undefined;
  hint: string | undefined;
} | {
  kind: 'mysql';
  code: number;
  message: string;
  state: string;
} | {
  kind: 'sqlite';
  /**
   * Sqlite extended error code: https://www.sqlite.org/rescode.html
   */
  extendedCode: number;
  message: string;
} | {
  kind: 'mssql';
  code: number;
  message: string;
};
declare type ErrorCapturingFunction<T> = T extends ((...args: infer A) => Promise<infer R>) ? (...args: A) => Promise<Result_4<ErrorCapturingInterface<R>>> : T extends ((...args: infer A) => infer R) ? (...args: A) => Result_4<ErrorCapturingInterface<R>> : T;
declare type ErrorCapturingInterface<T> = { [K in keyof T]: ErrorCapturingFunction<T[K]> };
declare interface ErrorCapturingSqlDriverAdapter extends ErrorCapturingInterface<SqlDriverAdapter> {
  readonly errorRegistry: ErrorRegistry;
}
declare type ErrorFormat$1 = 'pretty' | 'colorless' | 'minimal';
declare type ErrorRecord = {
  error: unknown;
};
declare interface ErrorRegistry {
  consumeError(id: number): ErrorRecord | undefined;
}
declare interface ErrorWithBatchIndex {
  batchRequestIdx?: number;
}
declare type EventCallback<E extends ExtendedEventType> = [E] extends ['beforeExit'] ? () => Promise<void> : [E] extends [LogLevel$1] ? (event: EngineEvent<E>) => void : never;
declare type Exact<A, W> = (A extends unknown ? (W extends A ? { [K in keyof A]: Exact<A[K], W[K]> } : W) : never) | (A extends Narrowable ? A : never);
/**
 * Defines Exception.
 *
 * string or an object with one of (message or name or code) and optional stack
 */
declare type Exception = ExceptionWithCode | ExceptionWithMessage | ExceptionWithName | string;
declare interface ExceptionWithCode {
  code: string | number;
  name?: string;
  message?: string;
  stack?: string;
}
declare interface ExceptionWithMessage {
  code?: string | number;
  message: string;
  name?: string;
  stack?: string;
}
declare interface ExceptionWithName {
  code?: string | number;
  message?: string;
  name: string;
  stack?: string;
}
declare type ExtendedEventType = LogLevel$1 | 'beforeExit';
declare type ExtendedSpanOptions = SpanOptions & {
  /** The name of the span */
  name: string;
  internal?: boolean;
  middleware?: boolean;
  /** Whether it propagates context (?=true) */
  active?: boolean;
  /** The context to append the span to */
  context?: Context;
};

/** $extends, defineExtension */
declare interface ExtendsHook<Variant extends 'extends' | 'define', TypeMapCb extends TypeMapCbDef, ExtArgs extends Record<string, any>, TypeMap extends TypeMapDef = Call<TypeMapCb, {
  extArgs: ExtArgs;
}>> {
  extArgs: ExtArgs;
  <R_ extends { [K in TypeMap['meta']['modelProps'] | '$allModels']?: unknown }, R, M_ extends { [K in TypeMap['meta']['modelProps'] | '$allModels']?: unknown }, M, Q_ extends { [K in TypeMap['meta']['modelProps'] | '$allModels' | keyof TypeMap['other']['operations'] | '$allOperations']?: unknown }, C_ extends { [K in string]?: unknown }, C, Args extends InternalArgs = InternalArgs<R, M, {}, C>, MergedArgs extends InternalArgs = MergeExtArgs<TypeMap, ExtArgs, Args>>(extension: ((client: DynamicClientExtensionThis<TypeMap, TypeMapCb, ExtArgs>) => {
    $extends: {
      extArgs: Args;
    };
  }) | {
    name?: string;
    query?: DynamicQueryExtensionArgs<Q_, TypeMap>;
    result?: DynamicResultExtensionArgs<R_, TypeMap> & R;
    model?: DynamicModelExtensionArgs<M_, TypeMap, TypeMapCb, ExtArgs> & M;
    client?: DynamicClientExtensionArgs<C_, TypeMap, TypeMapCb, ExtArgs> & C;
  }): {
    extends: DynamicClientExtensionThis<Call<TypeMapCb, {
      extArgs: MergedArgs;
    }>, TypeMapCb, MergedArgs>;
    define: (client: any) => {
      $extends: {
        extArgs: Args;
      };
    };
  }[Variant];
}
declare type ExtensionArgs = Optional<RequiredExtensionArgs>;
declare namespace Extensions {
  export { defineExtension, getExtensionContext };
}
declare namespace Extensions_2 {
  export { InternalArgs, DefaultArgs, GetPayloadResultExtensionKeys, GetPayloadResultExtensionObject, GetPayloadResult, GetSelect, GetOmit, DynamicQueryExtensionArgs, DynamicQueryExtensionCb, DynamicQueryExtensionCbArgs, DynamicQueryExtensionCbArgsArgs, DynamicResultExtensionArgs, DynamicResultExtensionNeeds, DynamicResultExtensionData, DynamicModelExtensionArgs, DynamicModelExtensionThis, DynamicModelExtensionOperationFn, DynamicModelExtensionFnResult, DynamicModelExtensionFnResultBase, DynamicModelExtensionFluentApi, DynamicModelExtensionFnResultNull, DynamicClientExtensionArgs, DynamicClientExtensionThis, ClientBuiltInProp, DynamicClientExtensionThisBuiltin, ExtendsHook, MergeExtArgs, AllModelsToStringIndex, TypeMapDef, DevTypeMapDef, DevTypeMapFnDef, ClientOptionDef, ClientOtherOps, TypeMapCbDef, ModelKey, RequiredExtensionArgs as UserArgs };
}
declare type ExtractGlobalOmit<Options, ModelName extends string> = Options extends {
  omit: { [K in ModelName]: infer GlobalOmit };
} ? GlobalOmit : {};
declare type Field = ReadonlyDeep_2<{
  kind: FieldKind;
  name: string;
  isRequired: boolean;
  isList: boolean;
  isUnique: boolean;
  isId: boolean;
  isReadOnly: boolean;
  isGenerated?: boolean;
  isUpdatedAt?: boolean;
  /**
   * Describes the data type in the same the way it is defined in the Prisma schema:
   * BigInt, Boolean, Bytes, DateTime, Decimal, Float, Int, JSON, String, $ModelName
   */
  type: string;
  /**
   * Native database type, if specified.
   * For example, `@db.VarChar(191)` is encoded as `['VarChar', ['191']]`,
   * `@db.Text` is encoded as `['Text', []]`.
   */
  nativeType?: [string, string[]] | null;
  dbName?: string | null;
  hasDefaultValue: boolean;
  default?: FieldDefault | FieldDefaultScalar | FieldDefaultScalar[];
  relationFromFields?: string[];
  relationToFields?: string[];
  relationOnDelete?: string;
  relationOnUpdate?: string;
  relationName?: string;
  documentation?: string;
}>;
declare type FieldDefault = ReadonlyDeep_2<{
  name: string;
  args: Array<string | number>;
}>;
declare type FieldDefaultScalar = string | boolean | number;
declare type FieldKind = 'scalar' | 'object' | 'enum' | 'unsupported';
declare type FieldLocation = 'scalar' | 'inputObjectTypes' | 'outputObjectTypes' | 'enumTypes' | 'fieldRefTypes';
declare type FieldNamespace = 'model' | 'prisma';

/**
 * A reference to a specific field of a specific model
 */
declare interface FieldRef$1<Model, FieldType> {
  readonly modelName: Model$1;
  readonly name: string;
  readonly typeName: FieldType;
  readonly isList: boolean;
}
declare type FieldRefAllowType = TypeRef<'scalar' | 'enumTypes'>;
declare type FieldRefType = ReadonlyDeep_2<{
  name: string;
  allowTypes: FieldRefAllowType[];
  fields: SchemaArg[];
}>;
declare type FluentOperation = 'findUnique' | 'findUniqueOrThrow' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'update' | 'upsert' | 'delete';
declare interface Fn<Params = unknown, Returns = unknown> {
  params: Params;
  returns: Returns;
}
declare interface GeneratorConfig {
  name: string;
  output: EnvValue | null;
  isCustomOutput?: boolean;
  provider: EnvValue;
  config: {
    /** `output` is a reserved name and will only be available directly at `generator.output` */
    output?: never;
    /** `provider` is a reserved name and will only be available directly at `generator.provider` */
    provider?: never;
    /** `binaryTargets` is a reserved name and will only be available directly at `generator.binaryTargets` */
    binaryTargets?: never;
    /** `previewFeatures` is a reserved name and will only be available directly at `generator.previewFeatures` */
    previewFeatures?: never;
  } & {
    [key: string]: string | string[] | undefined;
  };
  binaryTargets: BinaryTargetsEnvValue[];
  previewFeatures: string[];
  envPaths?: EnvPaths;
  sourceFilePath: string;
}
declare type GetAggregateResult<P extends OperationPayload, A> = { [K in keyof A as K extends Aggregate ? K : never]: K extends '_count' ? A[K] extends true ? number : Count<A[K]> : { [J in keyof A[K] & string]: P['scalars'][J] | null } };
declare function getBatchRequestPayload(batch: JsonQuery[], transaction?: TransactionOptions_2<unknown>): QueryEngineBatchRequest;
declare type GetBatchResult = {
  count: number;
};
declare type GetCountResult<A> = A extends {
  select: infer S;
} ? (S extends true ? number : Count<S>) : number;
declare function getExtensionContext<T>(that: T): Context_2<T>;
declare type GetFindResult<P extends OperationPayload, A, GlobalOmitOptions> = Equals<A, any> extends 1 ? DefaultSelection<P, A, GlobalOmitOptions$1> : A extends {
  select: infer S extends object;
} & Record<string, unknown> | {
  include: infer I extends object;
} & Record<string, unknown> ? { [K in keyof S | keyof I as (S & I)[K] extends false | undefined | Skip | null ? never : K]: (S & I)[K] extends object ? P extends SelectablePayloadFields<K, (infer O)[]> ? O extends OperationPayload ? GetFindResult<O, (S & I)[K], GlobalOmitOptions$1>[] : never : P extends SelectablePayloadFields<K, infer O | null> ? O extends OperationPayload ? GetFindResult<O, (S & I)[K], GlobalOmitOptions$1> | SelectField<P, K> & null : never : K extends '_count' ? Count<GetFindResult<P, (S & I)[K], GlobalOmitOptions$1>> : never : P extends SelectablePayloadFields<K, (infer O)[]> ? O extends OperationPayload ? DefaultSelection<O, {}, GlobalOmitOptions$1>[] : never : P extends SelectablePayloadFields<K, infer O | null> ? O extends OperationPayload ? DefaultSelection<O, {}, GlobalOmitOptions$1> | SelectField<P, K> & null : never : P extends {
  scalars: { [k in K]: infer O };
} ? O : K extends '_count' ? Count<P['objects']> : never } & (A extends {
  include: any;
} & Record<string, unknown> ? DefaultSelection<P, A & {
  omit: A['omit'];
}, GlobalOmitOptions$1> : unknown) : DefaultSelection<P, A, GlobalOmitOptions$1>;
declare type GetGroupByResult<P extends OperationPayload, A> = A extends {
  by: string[];
} ? Array<GetAggregateResult<P, A> & { [K in A['by'][number]]: P['scalars'][K] }> : A extends {
  by: string;
} ? Array<GetAggregateResult<P, A> & { [K in A['by']]: P['scalars'][K] }> : {}[];
declare type GetOmit<BaseKeys extends string, R extends InternalArgs['result'][string], ExtraType = never> = { [K in (string extends keyof R ? never : keyof R) | BaseKeys]?: boolean | ExtraType };
declare type GetPayloadResult<Base extends Record<any, any>, R extends InternalArgs['result'][string]> = Omit<Base, GetPayloadResultExtensionKeys<R>> & GetPayloadResultExtensionObject<R>;
declare type GetPayloadResultExtensionKeys<R extends InternalArgs['result'][string], KR extends keyof R = (string extends keyof R ? never : keyof R)> = KR;
declare type GetPayloadResultExtensionObject<R extends InternalArgs['result'][string]> = { [K in GetPayloadResultExtensionKeys<R>]: R[K] extends (() => {
  compute: (...args: any) => infer C;
}) ? C : never };
declare function getPrismaClient(config: GetPrismaClientConfig): {
  new (optionsArg?: PrismaClientOptions): {
    _originalClient: any;
    _runtimeDataModel: RuntimeDataModel;
    _requestHandler: RequestHandler;
    _connectionPromise?: Promise<any> | undefined;
    _disconnectionPromise?: Promise<any> | undefined;
    _engineConfig: EngineConfig;
    _accelerateEngineConfig: AccelerateEngineConfig;
    _clientVersion: string;
    _errorFormat: ErrorFormat$1;
    _tracingHelper: TracingHelper;
    _middlewares: MiddlewareHandler<QueryMiddleware>;
    _previewFeatures: string[];
    _activeProvider: string;
    _globalOmit?: GlobalOmitOptions$1 | undefined;
    _extensions: MergedExtensionsList;
    /**
     * @remarks This is used internally by Policy, do not rename or remove
     */
    _engine: Engine;
    /**
     * A fully constructed/applied Client that references the parent
     * PrismaClient. This is used for Client extensions only.
     */
    _appliedParent: any;
    _createPrismaPromise: PrismaPromiseFactory;
    /**
     * Hook a middleware into the client
     * @param middleware to hook
     */
    $use(middleware: QueryMiddleware): void;
    $on<E extends ExtendedEventType>(eventType: E, callback: EventCallback<E>): any;
    $connect(): Promise<void>;
    /**
     * Disconnect from the database
     */
    $disconnect(): Promise<void>;
    /**
     * Executes a raw query and always returns a number
     */
    $executeRawInternal(transaction: PrismaPromiseTransaction | undefined, clientMethod: string, args: RawQueryArgs, middlewareArgsMapper?: MiddlewareArgsMapper<unknown, unknown>): Promise<number>;
    /**
     * Executes a raw query provided through a safe tag function
     * @see https://github.com/prisma/prisma/issues/7142
     *
     * @param query
     * @param values
     * @returns
     */
    $executeRaw(query: TemplateStringsArray | Sql, ...values: any[]): PrismaPromise_2<unknown, any>;
    /**
     * Unsafe counterpart of `$executeRaw` that is susceptible to SQL injections
     * @see https://github.com/prisma/prisma/issues/7142
     *
     * @param query
     * @param values
     * @returns
     */
    $executeRawUnsafe(query: string, ...values: RawValue[]): PrismaPromise_2<unknown, any>;
    /**
     * Executes a raw command only for MongoDB
     *
     * @param command
     * @returns
     */
    $runCommandRaw(command: Record<string, JsInputValue>): PrismaPromise_2<unknown, any>;
    /**
     * Executes a raw query and returns selected data
     */
    $queryRawInternal(transaction: PrismaPromiseTransaction | undefined, clientMethod: string, args: RawQueryArgs, middlewareArgsMapper?: MiddlewareArgsMapper<unknown, unknown>): Promise<any>;
    /**
     * Executes a raw query provided through a safe tag function
     * @see https://github.com/prisma/prisma/issues/7142
     *
     * @param query
     * @param values
     * @returns
     */
    $queryRaw(query: TemplateStringsArray | Sql, ...values: any[]): PrismaPromise_2<unknown, any>;
    /**
     * Counterpart to $queryRaw, that returns strongly typed results
     * @param typedSql
     */
    $queryRawTyped(typedSql: UnknownTypedSql): PrismaPromise_2<unknown, any>;
    /**
     * Unsafe counterpart of `$queryRaw` that is susceptible to SQL injections
     * @see https://github.com/prisma/prisma/issues/7142
     *
     * @param query
     * @param values
     * @returns
     */
    $queryRawUnsafe(query: string, ...values: RawValue[]): PrismaPromise_2<unknown, any>;
    /**
     * Execute a batch of requests in a transaction
     * @param requests
     * @param options
     */
    _transactionWithArray({
      promises,
      options
    }: {
      promises: Array<PrismaPromise_2<any>>;
      options?: BatchTransactionOptions;
    }): Promise<any>;
    /**
     * Perform a long-running transaction
     * @param callback
     * @param options
     * @returns
     */
    _transactionWithCallback({
      callback,
      options
    }: {
      callback: (client: Client) => Promise<unknown>;
      options?: Options;
    }): Promise<unknown>;
    _createItxClient(transaction: PrismaPromiseInteractiveTransaction): Client;
    /**
     * Execute queries within a transaction
     * @param input a callback or a query list
     * @param options to set timeouts (callback)
     * @returns
     */
    $transaction(input: any, options?: any): Promise<any>;
    /**
     * Runs the middlewares over params before executing a request
     * @param internalParams
     * @returns
     */
    _request(internalParams: InternalRequestParams): Promise<any>;
    _executeRequest({
      args,
      clientMethod,
      dataPath,
      callsite,
      action,
      model,
      argsMapper,
      transaction,
      unpacker,
      otelParentCtx,
      customDataProxyFetch
    }: InternalRequestParams): Promise<any>;
    $metrics: MetricsClient;
    /**
     * Shortcut for checking a preview flag
     * @param feature preview flag
     * @returns
     */
    _hasPreviewFlag(feature: string): boolean;
    $applyPendingMigrations(): Promise<void>;
    $extends: typeof $extends;
    readonly [Symbol.toStringTag]: string;
  };
};
/**
 * Config that is stored into the generated client. When the generated client is
 * loaded, this same config is passed to {@link getPrismaClient} which creates a
 * closure with that config around a non-instantiated [[PrismaClient]].
 */
declare type GetPrismaClientConfig = {
  runtimeDataModel: RuntimeDataModel;
  generator?: GeneratorConfig;
  relativeEnvPaths?: {
    rootEnvPath?: string | null;
    schemaEnvPath?: string | null;
  };
  relativePath: string;
  dirname: string;
  clientVersion: string;
  engineVersion: string;
  datasourceNames: string[];
  activeProvider: ActiveConnectorType;
  /**
   * The contents of the schema encoded into a string
   * @remarks only used for the purpose of data proxy
   */
  inlineSchema: string;
  /**
   * A special env object just for the data proxy edge runtime.
   * Allows bundlers to inject their own env variables (Vercel).
   * Allows platforms to declare global variables as env (Workers).
   * @remarks only used for the purpose of data proxy
   */
  injectableEdgeEnv?: () => LoadedEnv;
  /**
   * The contents of the datasource url saved in a string.
   * This can either be an env var name or connection string.
   * It is needed by the client to connect to the Data Proxy.
   * @remarks only used for the purpose of data proxy
   */
  inlineDatasources: { [name in string]: {
    url: EnvValue;
  } };
  /**
   * The string hash that was produced for a given schema
   * @remarks only used for the purpose of data proxy
   */
  inlineSchemaHash: string;
  /**
   * A marker to indicate that the client was not generated via `prisma
   * generate` but was generated via `generate --postinstall` script instead.
   * @remarks used to error for Vercel/Netlify for schema caching issues
   */
  postinstall?: boolean;
  /**
   * Information about the CI where the Prisma Client has been generated. The
   * name of the CI environment is stored at generation time because CI
   * information is not always available at runtime. Moreover, the edge client
   * has no notion of environment variables, so this works around that.
   * @remarks used to error for Vercel/Netlify for schema caching issues
   */
  ciName?: string;
  /**
   * Information about whether we have not found a schema.prisma file in the
   * default location, and that we fell back to finding the schema.prisma file
   * in the current working directory. This usually means it has been bundled.
   */
  isBundled?: boolean;
  /**
   * A boolean that is `false` when the client was generated with --no-engine. At
   * runtime, this means the client will be bound to be using the Data Proxy.
   */
  copyEngine?: boolean;
  /**
   * Optional wasm loading configuration
   */
  engineWasm?: EngineWasmLoadingConfig;
  compilerWasm?: CompilerWasmLoadingConfig;
};
declare type GetResult<Payload extends OperationPayload, Args, OperationName extends Operation = 'findUniqueOrThrow', GlobalOmitOptions = {}> = {
  findUnique: GetFindResult<Payload, Args, GlobalOmitOptions$1> | null;
  findUniqueOrThrow: GetFindResult<Payload, Args, GlobalOmitOptions$1>;
  findFirst: GetFindResult<Payload, Args, GlobalOmitOptions$1> | null;
  findFirstOrThrow: GetFindResult<Payload, Args, GlobalOmitOptions$1>;
  findMany: GetFindResult<Payload, Args, GlobalOmitOptions$1>[];
  create: GetFindResult<Payload, Args, GlobalOmitOptions$1>;
  createMany: GetBatchResult;
  createManyAndReturn: GetFindResult<Payload, Args, GlobalOmitOptions$1>[];
  update: GetFindResult<Payload, Args, GlobalOmitOptions$1>;
  updateMany: GetBatchResult;
  updateManyAndReturn: GetFindResult<Payload, Args, GlobalOmitOptions$1>[];
  upsert: GetFindResult<Payload, Args, GlobalOmitOptions$1>;
  delete: GetFindResult<Payload, Args, GlobalOmitOptions$1>;
  deleteMany: GetBatchResult;
  aggregate: GetAggregateResult<Payload, Args>;
  count: GetCountResult<Args>;
  groupBy: GetGroupByResult<Payload, Args>;
  $queryRaw: unknown;
  $queryRawTyped: unknown;
  $executeRaw: number;
  $queryRawUnsafe: unknown;
  $executeRawUnsafe: number;
  $runCommandRaw: JsonObject;
  findRaw: JsonObject;
  aggregateRaw: JsonObject;
}[OperationName];
declare function getRuntime(): GetRuntimeOutput;
declare type GetRuntimeOutput = {
  id: RuntimeName;
  prettyName: string;
  isEdge: boolean;
};
declare type GetSelect<Base extends Record<any, any>, R extends InternalArgs['result'][string], KR extends keyof R = (string extends keyof R ? never : keyof R)> = { [K in KR | keyof Base]?: K extends KR ? boolean : Base[K] };
declare type GlobalOmitOptions$1 = {
  [modelName: string]: {
    [fieldName: string]: boolean;
  };
};
declare type HandleErrorParams = {
  args: JsArgs;
  error: any;
  clientMethod: string;
  callsite?: CallSite;
  transaction?: PrismaPromiseTransaction;
  modelName?: string;
  globalOmit?: GlobalOmitOptions$1;
};
declare type HrTime = [number, number];

/**
 * Defines High-Resolution Time.
 *
 * The first number, HrTime[0], is UNIX Epoch time in seconds since 00:00:00 UTC on 1 January 1970.
 * The second number, HrTime[1], represents the partial second elapsed since Unix Epoch time represented by first number in nanoseconds.
 * For example, 2021-01-01T12:30:10.150Z in UNIX Epoch time in milliseconds is represented as 1609504210150.
 * The first number is calculated by converting and truncating the Epoch time in milliseconds to seconds:
 * HrTime[0] = Math.trunc(1609504210150 / 1000) = 1609504210.
 * The second number is calculated by converting the digits after the decimal point of the subtraction, (1609504210150 / 1000) - HrTime[0], to nanoseconds:
 * HrTime[1] = Number((1609504210.150 - HrTime[0]).toFixed(9)) * 1e9 = 150000000.
 * This is represented in HrTime format as [1609504210, 150000000].
 */
declare type HrTime_2 = [number, number];
declare type Index = ReadonlyDeep_2<{
  model: string;
  type: IndexType;
  isDefinedOnField: boolean;
  name?: string;
  dbName?: string;
  algorithm?: string;
  clustered?: boolean;
  fields: IndexField[];
}>;
declare type IndexField = ReadonlyDeep_2<{
  name: string;
  sortOrder?: SortOrder;
  length?: number;
  operatorClass?: string;
}>;
declare type IndexType = 'id' | 'normal' | 'unique' | 'fulltext';

/**
 * Matches a JSON array.
 * Unlike \`JsonArray\`, readonly arrays are assignable to this type.
 */
declare interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}
/**
 * Matches a JSON object.
 * Unlike \`JsonObject\`, this type allows undefined and read-only properties.
 */
declare type InputJsonObject = { readonly [Key in string]?: InputJsonValue | null };
/**
 * Matches any valid value that can be used as an input for operations like
 * create and update as the value of a JSON field. Unlike \`JsonValue\`, this
 * type allows read-only arrays and read-only object properties and disallows
 * \`null\` at the top level.
 *
 * \`null\` cannot be used as the value of a JSON field because its meaning
 * would be ambiguous. Use \`Prisma.JsonNull\` to store the JSON null value or
 * \`Prisma.DbNull\` to clear the JSON value and set the field to the database
 * NULL value instead.
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
 */
declare type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray | {
  toJSON(): unknown;
};
declare type InputType = ReadonlyDeep_2<{
  name: string;
  constraints: {
    maxNumFields: number | null;
    minNumFields: number | null;
    fields?: string[];
  };
  meta?: {
    source?: string;
    grouping?: string;
  };
  fields: SchemaArg[];
}>;
declare type InputTypeRef = TypeRef<'scalar' | 'inputObjectTypes' | 'enumTypes' | 'fieldRefTypes'>;
declare type InteractiveTransactionInfo<Payload = unknown> = {
  /**
   * Transaction ID returned by the query engine.
   */
  id: string;
  /**
   * Arbitrary payload the meaning of which depends on the `Engine` implementation.
   * For example, `DataProxyEngine` needs to associate different API endpoints with transactions.
   * In `LibraryEngine` and `BinaryEngine` it is currently not used.
   */
  payload: Payload;
};
declare type InteractiveTransactionOptions<Payload> = Transaction_2.InteractiveTransactionInfo<Payload>;
declare type InternalArgs<R = { [K in string]: { [K in string]: unknown } }, M = { [K in string]: { [K in string]: unknown } }, Q = { [K in string]: { [K in string]: unknown } }, C = { [K in string]: unknown }> = {
  result: { [K in keyof R]: { [P in keyof R[K]]: () => R[K][P] } };
  model: { [K in keyof M]: { [P in keyof M[K]]: () => M[K][P] } };
  query: { [K in keyof Q]: { [P in keyof Q[K]]: () => Q[K][P] } };
  client: { [K in keyof C]: () => C[K] };
};
declare type InternalRequestParams = {
  /**
   * The original client method being called.
   * Even though the rootField / operation can be changed,
   * this method stays as it is, as it's what the user's
   * code looks like
   */
  clientMethod: string;
  /**
   * Name of js model that triggered the request. Might be used
   * for warnings or error messages
   */
  jsModelName?: string;
  callsite?: CallSite;
  transaction?: PrismaPromiseTransaction;
  unpacker?: Unpacker;
  otelParentCtx?: Context;
  /** Used to "desugar" a user input into an "expanded" one */
  argsMapper?: (args?: UserArgs_2) => UserArgs_2;
  /** Used to convert args for middleware and back */
  middlewareArgsMapper?: MiddlewareArgsMapper<unknown, unknown>;
  /** Used for Accelerate client extension via Data Proxy */
  customDataProxyFetch?: CustomDataProxyFetch;
} & Omit<QueryMiddlewareParams, 'runInTransaction'>;
declare type IsolationLevel = 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SNAPSHOT' | 'SERIALIZABLE';
declare type IsolationLevel_2 = 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Snapshot' | 'Serializable';
declare function isSkip(value: unknown): value is Skip;
declare function isTypedSql(value: unknown): value is UnknownTypedSql;
declare type ITXClientDenyList = (typeof denylist)[number];
declare const itxClientDenyList: readonly (string | symbol)[];
declare interface Job {
  resolve: (data: any) => void;
  reject: (data: any) => void;
  request: any;
}

/**
 * Create a SQL query for a list of values.
 */
declare function join(values: readonly RawValue[], separator?: string, prefix?: string, suffix?: string): Sql;
declare type JsArgs = {
  select?: Selection_2;
  include?: Selection_2;
  omit?: Omission;
  [argName: string]: JsInputValue;
};
declare type JsInputValue = null | undefined | string | number | boolean | bigint | Uint8Array | Date | DecimalJsLike | ObjectEnumValue | RawParameters | JsonConvertible | FieldRef$1<string, unknown> | JsInputValue[] | Skip | {
  [key: string]: JsInputValue;
};
declare type JsonArgumentValue = number | string | boolean | null | RawTaggedValue | JsonArgumentValue[] | {
  [key: string]: JsonArgumentValue;
};

/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON array.
 */
declare interface JsonArray extends Array<JsonValue> {}
declare type JsonBatchQuery = {
  batch: JsonQuery[];
  transaction?: {
    isolationLevel?: IsolationLevel_2;
  };
};
declare interface JsonConvertible {
  toJSON(): unknown;
}
declare type JsonFieldSelection = {
  arguments?: Record<string, JsonArgumentValue> | RawTaggedValue;
  selection: JsonSelectionSet;
};
declare class JsonNull extends NullTypesEnumValue {
  #private;
}

/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON object.
 * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from.
 */
declare type JsonObject = { [Key in string]?: JsonValue };
declare type JsonQuery = {
  modelName?: string;
  action: JsonQueryAction;
  query: JsonFieldSelection;
};
declare type JsonQueryAction = 'findUnique' | 'findUniqueOrThrow' | 'findFirst' | 'findFirstOrThrow' | 'findMany' | 'createOne' | 'createMany' | 'createManyAndReturn' | 'updateOne' | 'updateMany' | 'updateManyAndReturn' | 'deleteOne' | 'deleteMany' | 'upsertOne' | 'aggregate' | 'groupBy' | 'executeRaw' | 'queryRaw' | 'runCommandRaw' | 'findRaw' | 'aggregateRaw';
declare type JsonSelectionSet = {
  $scalars?: boolean;
  $composites?: boolean;
} & {
  [fieldName: string]: boolean | JsonFieldSelection;
};

/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches any valid JSON value.
 */
declare type JsonValue = string | number | boolean | JsonObject | JsonArray | null;
declare type JsOutputValue = null | string | number | boolean | bigint | Uint8Array | Date | Decimal | JsOutputValue[] | {
  [key: string]: JsOutputValue;
};
declare type JsPromise<T> = Promise<T> & {};
declare type KnownErrorParams = {
  code: string;
  clientVersion: string;
  meta?: Record<string, unknown>;
  batchRequestIdx?: number;
};

/**
 * A pointer from the current {@link Span} to another span in the same trace or
 * in a different trace.
 * Few examples of Link usage.
 * 1. Batch Processing: A batch of elements may contain elements associated
 *    with one or more traces/spans. Since there can only be one parent
 *    SpanContext, Link is used to keep reference to SpanContext of all
 *    elements in the batch.
 * 2. Public Endpoint: A SpanContext in incoming client request on a public
 *    endpoint is untrusted from service provider perspective. In such case it
 *    is advisable to start a new trace with appropriate sampling decision.
 *    However, it is desirable to associate incoming SpanContext to new trace
 *    initiated on service provider side so two traces (from Client and from
 *    Service Provider) can be correlated.
 */
declare interface Link {
  /** The {@link SpanContext} of a linked span. */
  context: SpanContext;
  /** A set of {@link SpanAttributes} on the link. */
  attributes?: SpanAttributes;
  /** Count of attributes of the link that were dropped due to collection limits */
  droppedAttributesCount?: number;
}
declare type LoadedEnv = {
  message?: string;
  parsed: {
    [x: string]: string;
  };
} | undefined;
declare type LocationInFile = {
  fileName: string;
  lineNumber: number | null;
  columnNumber: number | null;
};
declare type LogDefinition$1 = {
  level: LogLevel$1;
  emit: 'stdout' | 'event';
};

/**
 * Typings for the events we emit.
 *
 * @remarks
 * If this is updated, our edge runtime shim needs to be updated as well.
 */
declare type LogEmitter = {
  on<E extends EngineEventType>(event: E, listener: (event: EngineEvent<E>) => void): LogEmitter;
  emit(event: QueryEventType, payload: QueryEvent): boolean;
  emit(event: LogEventType, payload: LogEvent): boolean;
};
declare type LogEvent = {
  timestamp: Date;
  message: string;
  target: string;
};
declare type LogEventType = 'info' | 'warn' | 'error';
declare type LogLevel$1 = 'info' | 'query' | 'warn' | 'error';

/**
 * Generates more strict variant of an enum which, unlike regular enum,
 * throws on non-existing property access. This can be useful in following situations:
 * - we have an API, that accepts both `undefined` and `SomeEnumType` as an input
 * - enum values are generated dynamically from DMMF.
 *
 * In that case, if using normal enums and no compile-time typechecking, using non-existing property
 * will result in `undefined` value being used, which will be accepted. Using strict enum
 * in this case will help to have a runtime exception, telling you that you are probably doing something wrong.
 *
 * Note: if you need to check for existence of a value in the enum you can still use either
 * `in` operator or `hasOwnProperty` function.
 *
 * @param definition
 * @returns
 */
declare function makeStrictEnum<T extends Record<PropertyKey, string | number>>(definition: T): T;
declare function makeTypedQueryFactory(sql: string): (...values: any[]) => TypedSql<any[], unknown>;
declare type Mappings = ReadonlyDeep_2<{
  modelOperations: ModelMapping[];
  otherOperations: {
    read: string[];
    write: string[];
  };
}>;

/**
 * Class that holds the list of all extensions, applied to particular instance,
 * as well as resolved versions of the components that need to apply on
 * different levels. Main idea of this class: avoid re-resolving as much of the
 * stuff as possible when new extensions are added while also delaying the
 * resolve until the point it is actually needed. For example, computed fields
 * of the model won't be resolved unless the model is actually queried. Neither
 * adding extensions with `client` component only cause other components to
 * recompute.
 */
declare class MergedExtensionsList {
  private head?;
  private constructor();
  static empty(): MergedExtensionsList;
  static single(extension: ExtensionArgs): MergedExtensionsList;
  isEmpty(): boolean;
  append(extension: ExtensionArgs): MergedExtensionsList;
  getAllComputedFields(dmmfModelName: string): ComputedFieldsMap | undefined;
  getAllClientExtensions(): ClientArg | undefined;
  getAllModelExtensions(dmmfModelName: string): ModelArg | undefined;
  getAllQueryCallbacks(jsModelName: string, operation: string): any;
  getAllBatchQueryCallbacks(): BatchQueryOptionsCb[];
}
declare type MergeExtArgs<TypeMap extends TypeMapDef, ExtArgs extends Record<any, any>, Args extends Record<any, any>> = ComputeDeep<ExtArgs & Args & AllModelsToStringIndex<TypeMap, Args, 'result'> & AllModelsToStringIndex<TypeMap, Args, 'model'>>;
declare type Metric<T> = {
  key: string;
  value: T;
  labels: Record<string, string>;
  description: string;
};
declare type MetricHistogram = {
  buckets: MetricHistogramBucket[];
  sum: number;
  count: number;
};
declare type MetricHistogramBucket = [maxValue: number, count: number];
declare type Metrics = {
  counters: Metric<number>[];
  gauges: Metric<number>[];
  histograms: Metric<MetricHistogram>[];
};
declare class MetricsClient {
  private _client;
  constructor(client: Client);
  /**
   * Returns all metrics gathered up to this point in prometheus format.
   * Result of this call can be exposed directly to prometheus scraping endpoint
   *
   * @param options
   * @returns
   */
  prometheus(options?: MetricsOptions): Promise<string>;
  /**
   * Returns all metrics gathered up to this point in prometheus format.
   *
   * @param options
   * @returns
   */
  json(options?: MetricsOptions): Promise<Metrics>;
}
declare type MetricsOptions = {
  /**
   * Labels to add to every metrics in key-value format
   */
  globalLabels?: Record<string, string>;
};
declare type MetricsOptionsCommon = {
  globalLabels?: Record<string, string>;
};
declare type MetricsOptionsJson = {
  format: 'json';
} & MetricsOptionsCommon;
declare type MetricsOptionsPrometheus = {
  format: 'prometheus';
} & MetricsOptionsCommon;
declare type MiddlewareArgsMapper<RequestArgs, MiddlewareArgs> = {
  requestArgsToMiddlewareArgs(requestArgs: RequestArgs): MiddlewareArgs;
  middlewareArgsToRequestArgs(middlewareArgs: MiddlewareArgs): RequestArgs;
};
declare class MiddlewareHandler<M extends Function> {
  private _middlewares;
  use(middleware: M): void;
  get(id: number): M | undefined;
  has(id: number): boolean;
  length(): number;
}
declare type Model$1 = ReadonlyDeep_2<{
  name: string;
  dbName: string | null;
  schema: string | null;
  fields: Field[];
  uniqueFields: string[][];
  uniqueIndexes: uniqueIndex[];
  documentation?: string;
  primaryKey: PrimaryKey | null;
  isGenerated?: boolean;
}>;
declare enum ModelAction {
  findUnique = "findUnique",
  findUniqueOrThrow = "findUniqueOrThrow",
  findFirst = "findFirst",
  findFirstOrThrow = "findFirstOrThrow",
  findMany = "findMany",
  create = "create",
  createMany = "createMany",
  createManyAndReturn = "createManyAndReturn",
  update = "update",
  updateMany = "updateMany",
  updateManyAndReturn = "updateManyAndReturn",
  upsert = "upsert",
  delete = "delete",
  deleteMany = "deleteMany",
  groupBy = "groupBy",
  count = "count",
  // TODO: count does not actually exist in DMMF
  aggregate = "aggregate",
  findRaw = "findRaw",
  aggregateRaw = "aggregateRaw",
}
declare type ModelArg = { [MethodName in string]: unknown };
declare type ModelArgs = {
  model: { [ModelName in string]: ModelArg };
};
declare type ModelKey<TypeMap extends TypeMapDef, M extends PropertyKey> = M extends keyof TypeMap['model'] ? M : Capitalize<M & string>;
declare type ModelMapping = ReadonlyDeep_2<{
  model: string;
  plural: string;
  findUnique?: string | null;
  findUniqueOrThrow?: string | null;
  findFirst?: string | null;
  findFirstOrThrow?: string | null;
  findMany?: string | null;
  create?: string | null;
  createMany?: string | null;
  createManyAndReturn?: string | null;
  update?: string | null;
  updateMany?: string | null;
  updateManyAndReturn?: string | null;
  upsert?: string | null;
  delete?: string | null;
  deleteMany?: string | null;
  aggregate?: string | null;
  groupBy?: string | null;
  count?: string | null;
  findRaw?: string | null;
  aggregateRaw?: string | null;
}>;
declare type ModelQueryOptionsCb = (args: ModelQueryOptionsCbArgs) => Promise<any>;
declare type ModelQueryOptionsCbArgs = {
  model: string;
  operation: string;
  args: JsArgs;
  query: (args: JsArgs) => Promise<unknown>;
};
declare type MultiBatchResponse = {
  type: 'multi';
  plans: object[];
};
declare type NameArgs = {
  name?: string;
};
declare type Narrow<A> = { [K in keyof A]: A[K] extends Function ? A[K] : Narrow<A[K]> } | (A extends Narrowable ? A : never);
declare type Narrowable = string | number | bigint | boolean | [];
declare type NeverToUnknown<T> = [T] extends [never] ? unknown : T;
declare class NullTypesEnumValue extends ObjectEnumValue {
  _getNamespace(): string;
}

/**
 * Base class for unique values of object-valued enums.
 */
declare abstract class ObjectEnumValue {
  constructor(arg?: symbol);
  abstract _getNamespace(): string;
  _getName(): string;
  toString(): string;
}
declare const objectEnumValues: {
  classes: {
    DbNull: typeof DbNull;
    JsonNull: typeof JsonNull;
    AnyNull: typeof AnyNull;
  };
  instances: {
    DbNull: DbNull;
    JsonNull: JsonNull;
    AnyNull: AnyNull;
  };
};
declare const officialPrismaAdapters: readonly ["@prisma/adapter-planetscale", "@prisma/adapter-neon", "@prisma/adapter-libsql", "@prisma/adapter-better-sqlite3", "@prisma/adapter-d1", "@prisma/adapter-pg", "@prisma/adapter-mssql", "@prisma/adapter-mariadb"];
declare type Omission = Record<string, boolean | Skip>;
declare type Omit_2<T, K extends string | number | symbol> = { [P in keyof T as P extends K ? never : P]: T[P] };
declare type OmitValue<Omit, Key> = Key extends keyof Omit ? Omit[Key] : false;
declare type Operation = 'findFirst' | 'findFirstOrThrow' | 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'aggregate' | 'count' | 'groupBy' | '$queryRaw' | '$executeRaw' | '$queryRawUnsafe' | '$executeRawUnsafe' | 'findRaw' | 'aggregateRaw' | '$runCommandRaw';
declare type OperationPayload = {
  name: string;
  scalars: { [ScalarName in string]: unknown };
  objects: { [ObjectName in string]: unknown };
  composites: { [CompositeName in string]: unknown };
};
declare type Optional<O, K extends keyof any = keyof O> = { [P in K & keyof O]?: O[P] } & { [P in Exclude<keyof O, K>]: O[P] };
declare type OptionalFlat$1<T> = { [K in keyof T]?: T[K] };
declare type OptionalKeys<O> = { [K in keyof O]-?: {} extends Pick_2<O, K> ? K : never }[keyof O];
declare type Options = {
  /** Timeout for starting the transaction */
  maxWait?: number;
  /** Timeout for the transaction body */
  timeout?: number;
  /** Transaction isolation level */
  isolationLevel?: IsolationLevel_2;
};
declare type Options_2 = {
  clientVersion: string;
};
declare type Or$1<A extends 1 | 0, B extends 1 | 0> = {
  0: {
    0: 0;
    1: 1;
  };
  1: {
    0: 1;
    1: 1;
  };
}[A][B];
declare type OtherOperationMappings = ReadonlyDeep_2<{
  read: string[];
  write: string[];
}>;
declare type OutputType = ReadonlyDeep_2<{
  name: string;
  fields: SchemaField[];
}>;
declare type OutputTypeRef = TypeRef<'scalar' | 'outputObjectTypes' | 'enumTypes'>;
declare function Param<$Type, $Value extends string>(name: $Value): Param<$Type, $Value>;
declare type Param<out $Type, $Value extends string> = {
  readonly name: $Value;
};
declare type PatchFlat<O1, O2> = O1 & Omit_2<O2, keyof O1>;
declare type Path<O, P, Default = never> = O extends unknown ? P extends [infer K, ...infer R] ? K extends keyof O ? Path<O[K], R> : Default : O : never;
declare type Payload<T, F extends Operation = never> = T extends {
  [K: symbol]: {
    types: {
      payload: any;
    };
  };
} ? T[symbol]['types']['payload'] : any;
declare type PayloadToResult<P, O extends Record_2<any, any> = RenameAndNestPayloadKeys<P>> = { [K in keyof O]?: O[K][K] extends any[] ? PayloadToResult<O[K][K][number]>[] : O[K][K] extends object ? PayloadToResult<O[K][K]> : O[K][K] };
declare type Pick_2<T, K extends string | number | symbol> = { [P in keyof T as P extends K ? P : never]: T[P] };
declare type PrimaryKey = ReadonlyDeep_2<{
  name: string | null;
  fields: string[];
}>;
declare class PrismaClientInitializationError extends Error {
  clientVersion: string;
  errorCode?: string;
  retryable?: boolean;
  constructor(message: string, clientVersion: string, errorCode?: string);
  get [Symbol.toStringTag](): string;
}
declare class PrismaClientKnownRequestError extends Error implements ErrorWithBatchIndex {
  code: string;
  meta?: Record<string, unknown>;
  clientVersion: string;
  batchRequestIdx?: number;
  constructor(message: string, {
    code,
    clientVersion,
    meta,
    batchRequestIdx
  }: KnownErrorParams);
  get [Symbol.toStringTag](): string;
}
declare type PrismaClientOptions = {
  /**
   * Overwrites the primary datasource url from your schema.prisma file
   */
  datasourceUrl?: string;
  /**
   * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale.
   */
  adapter?: SqlDriverAdapterFactory | null;
  /**
   * Overwrites the datasource url from your schema.prisma file
   */
  datasources?: Datasources$1;
  /**
   * @default "colorless"
   */
  errorFormat?: ErrorFormat$1;
  /**
   * The default values for Transaction options
   * maxWait ?= 2000
   * timeout ?= 5000
   */
  transactionOptions?: Transaction_2.Options;
  /**
   * @example
   * \`\`\`
   * // Defaults to stdout
   * log: ['query', 'info', 'warn']
   *
   * // Emit as events
   * log: [
   *  { emit: 'stdout', level: 'query' },
   *  { emit: 'stdout', level: 'info' },
   *  { emit: 'stdout', level: 'warn' }
   * ]
   * \`\`\`
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
   */
  log?: Array<LogLevel$1 | LogDefinition$1>;
  omit?: GlobalOmitOptions$1;
  /**
   * @internal
   * You probably don't want to use this. \`__internal\` is used by internal tooling.
   */
  __internal?: {
    debug?: boolean;
    engine?: {
      cwd?: string;
      binaryPath?: string;
      endpoint?: string;
      allowTriggerPanic?: boolean;
    };
    /** This can be used for testing purposes */
    configOverride?: (config: GetPrismaClientConfig) => GetPrismaClientConfig;
  };
};
declare class PrismaClientRustPanicError extends Error {
  clientVersion: string;
  constructor(message: string, clientVersion: string);
  get [Symbol.toStringTag](): string;
}
declare class PrismaClientUnknownRequestError extends Error implements ErrorWithBatchIndex {
  clientVersion: string;
  batchRequestIdx?: number;
  constructor(message: string, {
    clientVersion,
    batchRequestIdx
  }: UnknownErrorParams);
  get [Symbol.toStringTag](): string;
}
declare class PrismaClientValidationError extends Error {
  name: string;
  clientVersion: string;
  constructor(message: string, {
    clientVersion
  }: Options_2);
  get [Symbol.toStringTag](): string;
}
declare function prismaGraphQLToJSError({
  error,
  user_facing_error
}: RequestError, clientVersion: string, activeProvider: string): PrismaClientKnownRequestError | PrismaClientUnknownRequestError;
declare type PrismaOperationSpec<TArgs, TAction = string> = {
  args: TArgs;
  action: TAction;
  model: string;
};
declare interface PrismaPromise<T> extends Promise<T> {
  [Symbol.toStringTag]: 'PrismaPromise';
}
/**
 * Prisma's `Promise` that is backwards-compatible. All additions on top of the
 * original `Promise` are optional so that it can be backwards-compatible.
 * @see [[createPrismaPromise]]
 */
declare interface PrismaPromise_2<TResult, TSpec extends PrismaOperationSpec<unknown> = any> extends Promise<TResult> {
  get spec(): TSpec;
  /**
   * Extension of the original `.then` function
   * @param onfulfilled same as regular promises
   * @param onrejected same as regular promises
   * @param transaction transaction options
   */
  then<R1 = TResult, R2 = never>(onfulfilled?: (value: TResult) => R1 | PromiseLike<R1>, onrejected?: (error: unknown) => R2 | PromiseLike<R2>, transaction?: PrismaPromiseTransaction): Promise<R1 | R2>;
  /**
   * Extension of the original `.catch` function
   * @param onrejected same as regular promises
   * @param transaction transaction options
   */
  catch<R = never>(onrejected?: ((reason: any) => R | PromiseLike<R>) | undefined | null, transaction?: PrismaPromiseTransaction): Promise<TResult | R>;
  /**
   * Extension of the original `.finally` function
   * @param onfinally same as regular promises
   * @param transaction transaction options
   */
  finally(onfinally?: (() => void) | undefined | null, transaction?: PrismaPromiseTransaction): Promise<TResult>;
  /**
   * Called when executing a batch of regular tx
   * @param transaction transaction options for batch tx
   */
  requestTransaction?(transaction: PrismaPromiseBatchTransaction): PromiseLike<unknown>;
}
declare type PrismaPromiseBatchTransaction = {
  kind: 'batch';
  id: number;
  isolationLevel?: IsolationLevel_2;
  index: number;
  lock: PromiseLike<void>;
};
declare type PrismaPromiseCallback = (transaction?: PrismaPromiseTransaction) => Promise<unknown>;

/**
 * Creates a [[PrismaPromise]]. It is Prisma's implementation of `Promise` which
 * is essentially a proxy for `Promise`. All the transaction-compatible client
 * methods return one, this allows for pre-preparing queries without executing
 * them until `.then` is called. It's the foundation of Prisma's query batching.
 * @param callback that will be wrapped within our promise implementation
 * @see [[PrismaPromise]]
 * @returns
 */
declare type PrismaPromiseFactory = <T extends PrismaOperationSpec<unknown>>(callback: PrismaPromiseCallback, op?: T) => PrismaPromise_2<unknown>;
declare type PrismaPromiseInteractiveTransaction<PayloadType = unknown> = {
  kind: 'itx';
  id: string;
  payload: PayloadType;
};
declare type PrismaPromiseTransaction<PayloadType = unknown> = PrismaPromiseBatchTransaction | PrismaPromiseInteractiveTransaction<PayloadType>;
declare const PrivateResultType: unique symbol;
declare type Provider = 'mysql' | 'postgres' | 'sqlite' | 'sqlserver';
declare namespace Public {
  export { validator };
}
declare namespace Public_2 {
  export { Args, Result$1 as Result, Payload, PrismaPromise, Operation, Exact };
}
declare type Query = ReadonlyDeep_2<{
  name: string;
  args: SchemaArg[];
  output: QueryOutput;
}>;
declare interface Queryable<Query, Result> extends AdapterInfo {
  /**
   * Execute a query and return its result.
   */
  queryRaw(params: Query): Promise<Result$1>;
  /**
   * Execute a query and return the number of affected rows.
   */
  executeRaw(params: Query): Promise<number>;
}
declare type QueryCompiler = {
  compile(request: string): {};
  compileBatch(batchRequest: string): BatchResponse;
  free(): void;
};
declare interface QueryCompilerConstructor {
  new (options: QueryCompilerOptions): QueryCompiler;
}
declare type QueryCompilerOptions = {
  datamodel: string;
  provider: Provider;
  connectionInfo: ConnectionInfo;
};
declare type QueryEngineBatchGraphQLRequest = {
  batch: QueryEngineRequest[];
  transaction?: boolean;
  isolationLevel?: IsolationLevel_2;
};
declare type QueryEngineBatchRequest = QueryEngineBatchGraphQLRequest | JsonBatchQuery;
declare type QueryEngineConfig = {
  datamodel: string;
  configDir: string;
  logQueries: boolean;
  ignoreEnvVarErrors: boolean;
  datasourceOverrides: Record<string, string>;
  env: Record<string, string | undefined>;
  logLevel: QueryEngineLogLevel;
  engineProtocol: QueryEngineProtocol;
  enableTracing: boolean;
};
declare interface QueryEngineConstructor {
  new (config: QueryEngineConfig, logger: (log: string) => void, adapter?: ErrorCapturingSqlDriverAdapter): QueryEngineInstance;
}
declare type QueryEngineInstance = {
  connect(headers: string, requestId: string): Promise<void>;
  disconnect(headers: string, requestId: string): Promise<void>;
  /**
   * Frees any resources allocated by the engine's WASM instance. This method is automatically created by WASM bindgen.
   * Noop for other engines.
   */
  free?(): void;
  /**
   * @param requestStr JSON.stringified `QueryEngineRequest | QueryEngineBatchRequest`
   * @param headersStr JSON.stringified `QueryEngineRequestHeaders`
   */
  query(requestStr: string, headersStr: string, transactionId: string | undefined, requestId: string): Promise<string>;
  sdlSchema?(): Promise<string>;
  startTransaction(options: string, traceHeaders: string, requestId: string): Promise<string>;
  commitTransaction(id: string, traceHeaders: string, requestId: string): Promise<string>;
  rollbackTransaction(id: string, traceHeaders: string, requestId: string): Promise<string>;
  metrics?(options: string): Promise<string>;
  applyPendingMigrations?(): Promise<void>;
  trace(requestId: string): Promise<string | null>;
};
declare type QueryEngineLogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'off';
declare type QueryEngineProtocol = 'graphql' | 'json';
declare type QueryEngineRequest = {
  query: string;
  variables: Object;
};
declare type QueryEngineResultData<T> = {
  data: T;
};
declare type QueryEvent = {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
};
declare type QueryEventType = 'query';
declare type QueryIntrospectionBuiltinType = 'int' | 'bigint' | 'float' | 'double' | 'string' | 'enum' | 'bytes' | 'bool' | 'char' | 'decimal' | 'json' | 'xml' | 'uuid' | 'datetime' | 'date' | 'time' | 'int-array' | 'bigint-array' | 'float-array' | 'double-array' | 'string-array' | 'char-array' | 'bytes-array' | 'bool-array' | 'decimal-array' | 'json-array' | 'xml-array' | 'uuid-array' | 'datetime-array' | 'date-array' | 'time-array' | 'null' | 'unknown';
declare type QueryMiddleware = (params: QueryMiddlewareParams, next: (params: QueryMiddlewareParams) => Promise<unknown>) => Promise<unknown>;
declare type QueryMiddlewareParams = {
  /** The model this is executed on */
  model?: string;
  /** The action that is being handled */
  action: Action;
  /** TODO what is this */
  dataPath: string[];
  /** TODO what is this */
  runInTransaction: boolean;
  args?: UserArgs_2;
};
declare type QueryOptions = {
  query: { [ModelName in string]: { [ModelAction in string]: ModelQueryOptionsCb } | QueryOptionsCb };
};
declare type QueryOptionsCb = (args: QueryOptionsCbArgs) => Promise<any>;
declare type QueryOptionsCbArgs = {
  model?: string;
  operation: string;
  args: JsArgs | RawQueryArgs;
  query: (args: JsArgs | RawQueryArgs) => Promise<unknown>;
};
declare type QueryOutput = ReadonlyDeep_2<{
  name: string;
  isRequired: boolean;
  isList: boolean;
}>;

/**
 * Create raw SQL statement.
 */
declare function raw(value: string): Sql;
declare type RawParameters = {
  __prismaRawParameters__: true;
  values: string;
};
declare type RawQueryArgs = Sql | UnknownTypedSql | [query: string, ...values: RawValue[]];
declare type RawResponse = {
  columns: string[];
  types: QueryIntrospectionBuiltinType[];
  rows: unknown[][];
};
declare type RawTaggedValue = {
  $type: 'Raw';
  value: unknown;
};

/**
 * Supported value or SQL instance.
 */
declare type RawValue = Value | Sql;
declare type ReadonlyDeep<T> = { readonly [K in keyof T]: ReadonlyDeep<T[K]> };
declare type ReadonlyDeep_2<O> = { +readonly [K in keyof O]: ReadonlyDeep_2<O[K]> };
declare type Record_2<T extends string | number | symbol, U> = { [P in T]: U };
declare type RenameAndNestPayloadKeys<P> = { [K in keyof P as K extends 'scalars' | 'objects' | 'composites' ? keyof P[K] : never]: P[K] };
declare type RequestBatchOptions<InteractiveTransactionPayload> = {
  transaction?: TransactionOptions_2<InteractiveTransactionPayload>;
  traceparent?: string;
  numTry?: number;
  containsWrite: boolean;
  customDataProxyFetch?: CustomDataProxyFetch;
};
declare interface RequestError {
  error: string;
  user_facing_error: {
    is_panic: boolean;
    message: string;
    meta?: Record<string, unknown>;
    error_code?: string;
    batch_request_idx?: number;
  };
}
declare class RequestHandler {
  client: Client;
  dataloader: DataLoader<RequestParams>;
  private logEmitter?;
  constructor(client: Client, logEmitter?: LogEmitter);
  request(params: RequestParams): Promise<any>;
  mapQueryEngineResult({
    dataPath,
    unpacker
  }: RequestParams, response: QueryEngineResultData<any>): any;
  /**
   * Handles the error and logs it, logging the error is done synchronously waiting for the event
   * handlers to finish.
   */
  handleAndLogRequestError(params: HandleErrorParams): never;
  handleRequestError({
    error,
    clientMethod,
    callsite,
    transaction,
    args,
    modelName,
    globalOmit
  }: HandleErrorParams): never;
  sanitizeMessage(message: any): any;
  unpack(data: unknown, dataPath: string[], unpacker?: Unpacker): any;
  get [Symbol.toStringTag](): string;
}
declare type RequestOptions<InteractiveTransactionPayload> = {
  traceparent?: string;
  numTry?: number;
  interactiveTransaction?: InteractiveTransactionOptions<InteractiveTransactionPayload>;
  isWrite: boolean;
  customDataProxyFetch?: CustomDataProxyFetch;
};
declare type RequestParams = {
  modelName?: string;
  action: Action;
  protocolQuery: JsonQuery;
  dataPath: string[];
  clientMethod: string;
  callsite?: CallSite;
  transaction?: PrismaPromiseTransaction;
  extensions: MergedExtensionsList;
  args?: any;
  headers?: Record<string, string>;
  unpacker?: Unpacker;
  otelParentCtx?: Context;
  otelChildCtx?: Context;
  globalOmit?: GlobalOmitOptions$1;
  customDataProxyFetch?: CustomDataProxyFetch;
};
declare type RequiredExtensionArgs = NameArgs & ResultArgs & ModelArgs & ClientArgs & QueryOptions;
declare type RequiredKeys$1<O> = { [K in keyof O]-?: {} extends Pick_2<O, K> ? never : K }[keyof O];
declare function resolveDatasourceUrl({
  inlineDatasources,
  overrideDatasources,
  env,
  clientVersion
}: {
  inlineDatasources: GetPrismaClientConfig['inlineDatasources'];
  overrideDatasources: Datasources$1;
  env: Record<string, string | undefined>;
  clientVersion: string;
}): string;
declare type Result$1<T, A, F extends Operation> = T extends {
  [K: symbol]: {
    types: {
      payload: any;
    };
  };
} ? GetResult<T[symbol]['types']['payload'], A, F> : GetResult<{
  composites: {};
  objects: {};
  scalars: {};
  name: '';
}, {}, F>;
declare type Result_2<T, A, F extends Operation> = Result$1<T, A, F>;
declare namespace Result_3 {
  export { Count, GetFindResult, SelectablePayloadFields, SelectField, DefaultSelection, UnwrapPayload, ApplyOmit, OmitValue, GetCountResult, Aggregate, GetAggregateResult, GetBatchResult, GetGroupByResult, GetResult, ExtractGlobalOmit };
}
declare type Result_4<T> = {
  map<U>(fn: (value: T) => U): Result_4<U>;
  flatMap<U>(fn: (value: T) => Result_4<U>): Result_4<U>;
} & ({
  readonly ok: true;
  readonly value: T;
} | {
  readonly ok: false;
  readonly error: Error_2;
});
declare type ResultArg = { [FieldName in string]: ResultFieldDefinition };
declare type ResultArgs = {
  result: { [ModelName in string]: ResultArg };
};
declare type ResultArgsFieldCompute = (model: any) => unknown;
declare type ResultFieldDefinition = {
  needs?: { [FieldName in string]: boolean };
  compute: ResultArgsFieldCompute;
};
declare type Return<T> = T extends ((...args: any[]) => infer R) ? R : T;
declare type RuntimeDataModel = {
  readonly models: Record<string, RuntimeModel>;
  readonly enums: Record<string, RuntimeEnum>;
  readonly types: Record<string, RuntimeModel>;
};
declare type RuntimeEnum = Omit<DMMF_2.DatamodelEnum, 'name'>;
declare type RuntimeModel = Omit<DMMF_2.Model, 'name'>;
declare type RuntimeName = 'workerd' | 'deno' | 'netlify' | 'node' | 'bun' | 'edge-light' | '';
declare type Schema = ReadonlyDeep_2<{
  rootQueryType?: string;
  rootMutationType?: string;
  inputObjectTypes: {
    model?: InputType[];
    prisma: InputType[];
  };
  outputObjectTypes: {
    model: OutputType[];
    prisma: OutputType[];
  };
  enumTypes: {
    model?: SchemaEnum[];
    prisma: SchemaEnum[];
  };
  fieldRefTypes: {
    prisma?: FieldRefType[];
  };
}>;
declare type SchemaArg = ReadonlyDeep_2<{
  name: string;
  comment?: string;
  isNullable: boolean;
  isRequired: boolean;
  inputTypes: InputTypeRef[];
  deprecation?: Deprecation;
}>;
declare type SchemaEnum = ReadonlyDeep_2<{
  name: string;
  values: string[];
}>;
declare type SchemaField = ReadonlyDeep_2<{
  name: string;
  isNullable?: boolean;
  outputType: OutputTypeRef;
  args: SchemaArg[];
  deprecation?: Deprecation;
  documentation?: string;
}>;
declare type Select<T, U> = T extends U ? T : never;
declare type SelectablePayloadFields<K extends PropertyKey, O> = {
  objects: { [k in K]: O };
} | {
  composites: { [k in K]: O };
};
declare type SelectField<P extends SelectablePayloadFields<any, any>, K extends PropertyKey> = P extends {
  objects: Record<K, any>;
} ? P['objects'][K] : P extends {
  composites: Record<K, any>;
} ? P['composites'][K] : never;
declare type Selection_2 = Record<string, boolean | Skip | JsArgs>;
declare function serializeJsonQuery({
  modelName,
  action,
  args,
  runtimeDataModel,
  extensions,
  callsite,
  clientMethod,
  errorFormat,
  clientVersion,
  previewFeatures,
  globalOmit
}: SerializeParams): JsonQuery;
declare type SerializeParams = {
  runtimeDataModel: RuntimeDataModel;
  modelName?: string;
  action: Action;
  args?: JsArgs;
  extensions?: MergedExtensionsList;
  callsite?: CallSite;
  clientMethod: string;
  clientVersion: string;
  errorFormat: ErrorFormat$1;
  previewFeatures: string[];
  globalOmit?: GlobalOmitOptions$1;
};
declare class Skip {
  constructor(param?: symbol);
  ifUndefined<T>(value: T | undefined): T | Skip;
}
declare const skip: Skip;
declare type SortOrder = 'asc' | 'desc';

/**
 * An interface that represents a span. A span represents a single operation
 * within a trace. Examples of span might include remote procedure calls or a
 * in-process function calls to sub-components. A Trace has a single, top-level
 * "root" Span that in turn may have zero or more child Spans, which in turn
 * may have children.
 *
 * Spans are created by the {@link Tracer.startSpan} method.
 */
declare interface Span {
  /**
   * Returns the {@link SpanContext} object associated with this Span.
   *
   * Get an immutable, serializable identifier for this span that can be used
   * to create new child spans. Returned SpanContext is usable even after the
   * span ends.
   *
   * @returns the SpanContext object associated with this Span.
   */
  spanContext(): SpanContext;
  /**
   * Sets an attribute to the span.
   *
   * Sets a single Attribute with the key and value passed as arguments.
   *
   * @param key the key for this attribute.
   * @param value the value for this attribute. Setting a value null or
   *              undefined is invalid and will result in undefined behavior.
   */
  setAttribute(key: string, value: SpanAttributeValue): this;
  /**
   * Sets attributes to the span.
   *
   * @param attributes the attributes that will be added.
   *                   null or undefined attribute values
   *                   are invalid and will result in undefined behavior.
   */
  setAttributes(attributes: SpanAttributes): this;
  /**
   * Adds an event to the Span.
   *
   * @param name the name of the event.
   * @param [attributesOrStartTime] the attributes that will be added; these are
   *     associated with this event. Can be also a start time
   *     if type is {@type TimeInput} and 3rd param is undefined
   * @param [startTime] start time of the event.
   */
  addEvent(name: string, attributesOrStartTime?: SpanAttributes | TimeInput, startTime?: TimeInput): this;
  /**
   * Adds a single link to the span.
   *
   * Links added after the creation will not affect the sampling decision.
   * It is preferred span links be added at span creation.
   *
   * @param link the link to add.
   */
  addLink(link: Link): this;
  /**
   * Adds multiple links to the span.
   *
   * Links added after the creation will not affect the sampling decision.
   * It is preferred span links be added at span creation.
   *
   * @param links the links to add.
   */
  addLinks(links: Link[]): this;
  /**
   * Sets a status to the span. If used, this will override the default Span
   * status. Default is {@link SpanStatusCode.UNSET}. SetStatus overrides the value
   * of previous calls to SetStatus on the Span.
   *
   * @param status the SpanStatus to set.
   */
  setStatus(status: SpanStatus): this;
  /**
   * Updates the Span name.
   *
   * This will override the name provided via {@link Tracer.startSpan}.
   *
   * Upon this update, any sampling behavior based on Span name will depend on
   * the implementation.
   *
   * @param name the Span name.
   */
  updateName(name: string): this;
  /**
   * Marks the end of Span execution.
   *
   * Call to End of a Span MUST not have any effects on child spans. Those may
   * still be running and can be ended later.
   *
   * Do not return `this`. The Span generally should not be used after it
   * is ended so chaining is not desired in this context.
   *
   * @param [endTime] the time to set as Span's end time. If not provided,
   *     use the current time as the span's end time.
   */
  end(endTime?: TimeInput): void;
  /**
   * Returns the flag whether this span will be recorded.
   *
   * @returns true if this Span is active and recording information like events
   *     with the `AddEvent` operation and attributes using `setAttributes`.
   */
  isRecording(): boolean;
  /**
   * Sets exception as a span event
   * @param exception the exception the only accepted values are string or Error
   * @param [time] the time to set as Span's event time. If not provided,
   *     use the current time.
   */
  recordException(exception: Exception, time?: TimeInput): void;
}

/**
 * @deprecated please use {@link Attributes}
 */
declare type SpanAttributes = Attributes;

/**
 * @deprecated please use {@link AttributeValue}
 */
declare type SpanAttributeValue = AttributeValue;
declare type SpanCallback<R> = (span?: Span, context?: Context) => R;

/**
 * A SpanContext represents the portion of a {@link Span} which must be
 * serialized and propagated along side of a {@link Baggage}.
 */
declare interface SpanContext {
  /**
   * The ID of the trace that this span belongs to. It is worldwide unique
   * with practically sufficient probability by being made as 16 randomly
   * generated bytes, encoded as a 32 lowercase hex characters corresponding to
   * 128 bits.
   */
  traceId: string;
  /**
   * The ID of the Span. It is globally unique with practically sufficient
   * probability by being made as 8 randomly generated bytes, encoded as a 16
   * lowercase hex characters corresponding to 64 bits.
   */
  spanId: string;
  /**
   * Only true if the SpanContext was propagated from a remote parent.
   */
  isRemote?: boolean;
  /**
   * Trace flags to propagate.
   *
   * It is represented as 1 byte (bitmap). Bit to represent whether trace is
   * sampled or not. When set, the least significant bit documents that the
   * caller may have recorded trace data. A caller who does not record trace
   * data out-of-band leaves this flag unset.
   *
   * see {@link TraceFlags} for valid flag values.
   */
  traceFlags: number;
  /**
   * Tracing-system-specific info to propagate.
   *
   * The tracestate field value is a `list` as defined below. The `list` is a
   * series of `list-members` separated by commas `,`, and a list-member is a
   * key/value pair separated by an equals sign `=`. Spaces and horizontal tabs
   * surrounding `list-members` are ignored. There can be a maximum of 32
   * `list-members` in a `list`.
   * More Info: https://www.w3.org/TR/trace-context/#tracestate-field
   *
   * Examples:
   *     Single tracing system (generic format):
   *         tracestate: rojo=00f067aa0ba902b7
   *     Multiple tracing systems (with different formatting):
   *         tracestate: rojo=00f067aa0ba902b7,congo=t61rcWkgMzE
   */
  traceState?: TraceState;
}
declare enum SpanKind {
  /** Default value. Indicates that the span is used internally. */
  INTERNAL = 0,
  /**
   * Indicates that the span covers server-side handling of an RPC or other
   * remote request.
   */
  SERVER = 1,
  /**
   * Indicates that the span covers the client-side wrapper around an RPC or
   * other remote request.
   */
  CLIENT = 2,
  /**
   * Indicates that the span describes producer sending a message to a
   * broker. Unlike client and server, there is no direct critical path latency
   * relationship between producer and consumer spans.
   */
  PRODUCER = 3,
  /**
   * Indicates that the span describes consumer receiving a message from a
   * broker. Unlike client and server, there is no direct critical path latency
   * relationship between producer and consumer spans.
   */
  CONSUMER = 4,
}

/**
 * Options needed for span creation
 */
declare interface SpanOptions {
  /**
   * The SpanKind of a span
   * @default {@link SpanKind.INTERNAL}
   */
  kind?: SpanKind;
  /** A span's attributes */
  attributes?: SpanAttributes;
  /** {@link Link}s span to other spans */
  links?: Link[];
  /** A manually specified start time for the created `Span` object. */
  startTime?: TimeInput;
  /** The new span should be a root span. (Ignore parent from context). */
  root?: boolean;
}
declare interface SpanStatus {
  /** The status code of this message. */
  code: SpanStatusCode;
  /** A developer-facing error message. */
  message?: string;
}

/**
 * An enumeration of status codes.
 */
declare enum SpanStatusCode {
  /**
   * The default status.
   */
  UNSET = 0,
  /**
   * The operation has been validated by an Application developer or
   * Operator to have completed successfully.
   */
  OK = 1,
  /**
   * The operation contains an error.
   */
  ERROR = 2,
}

/**
 * A SQL instance can be nested within each other to build SQL strings.
 */
declare class Sql {
  readonly values: Value[];
  readonly strings: string[];
  constructor(rawStrings: readonly string[], rawValues: readonly RawValue[]);
  get sql(): string;
  get statement(): string;
  get text(): string;
  inspect(): {
    sql: string;
    statement: string;
    text: string;
    values: unknown[];
  };
}
declare interface SqlDriverAdapter extends SqlQueryable {
  /**
   * Execute multiple SQL statements separated by semicolon.
   */
  executeScript(script: string): Promise<void>;
  /**
   * Start new transaction.
   */
  startTransaction(isolationLevel?: IsolationLevel): Promise<Transaction>;
  /**
   * Optional method that returns extra connection info
   */
  getConnectionInfo?(): ConnectionInfo;
  /**
   * Dispose of the connection and release any resources.
   */
  dispose(): Promise<void>;
}
declare interface SqlDriverAdapterFactory extends DriverAdapterFactory<SqlQuery, SqlResultSet> {
  connect(): Promise<SqlDriverAdapter>;
}
declare type SqlQuery = {
  sql: string;
  args: Array<unknown>;
  argTypes: Array<ArgType>;
};
declare interface SqlQueryable extends Queryable<SqlQuery, SqlResultSet> {}
declare interface SqlResultSet {
  /**
   * List of column types appearing in a database query, in the same order as `columnNames`.
   * They are used within the Query Engine to convert values from JS to Quaint values.
   */
  columnTypes: Array<ColumnType>;
  /**
   * List of column names appearing in a database query, in the same order as `columnTypes`.
   */
  columnNames: Array<string>;
  /**
   * List of rows retrieved from a database query.
   * Each row is a list of values, whose length matches `columnNames` and `columnTypes`.
   */
  rows: Array<Array<unknown>>;
  /**
   * The last ID of an `INSERT` statement, if any.
   * This is required for `AUTO_INCREMENT` columns in databases based on MySQL and SQLite.
   */
  lastInsertId?: string;
}

/**
 * Create a SQL object from a template string.
 */
declare function sqltag(strings: readonly string[], ...values: readonly RawValue[]): Sql;
/**
 * Defines TimeInput.
 *
 * hrtime, epoch milliseconds, performance.now() or Date
 */
declare type TimeInput = HrTime_2 | number | Date;
declare type ToTuple<T> = T extends any[] ? T : [T];
declare interface TraceState {
  /**
   * Create a new TraceState which inherits from this TraceState and has the
   * given key set.
   * The new entry will always be added in the front of the list of states.
   *
   * @param key key of the TraceState entry.
   * @param value value of the TraceState entry.
   */
  set(key: string, value: string): TraceState;
  /**
   * Return a new TraceState which inherits from this TraceState but does not
   * contain the given key.
   *
   * @param key the key for the TraceState entry to be removed.
   */
  unset(key: string): TraceState;
  /**
   * Returns the value to which the specified key is mapped, or `undefined` if
   * this map contains no mapping for the key.
   *
   * @param key with which the specified value is to be associated.
   * @returns the value to which the specified key is mapped, or `undefined` if
   *     this map contains no mapping for the key.
   */
  get(key: string): string | undefined;
  /**
   * Serializes the TraceState to a `list` as defined below. The `list` is a
   * series of `list-members` separated by commas `,`, and a list-member is a
   * key/value pair separated by an equals sign `=`. Spaces and horizontal tabs
   * surrounding `list-members` are ignored. There can be a maximum of 32
   * `list-members` in a `list`.
   *
   * @returns the serialized string.
   */
  serialize(): string;
}
declare interface TracingHelper {
  isEnabled(): boolean;
  getTraceParent(context?: Context): string;
  dispatchEngineSpans(spans: EngineSpan[]): void;
  getActiveContext(): Context | undefined;
  runInChildSpan<R>(nameOrOptions: string | ExtendedSpanOptions, callback: SpanCallback<R>): R;
}
declare interface Transaction extends AdapterInfo, SqlQueryable {
  /**
   * Transaction options.
   */
  readonly options: TransactionOptions;
  /**
   * Commit the transaction.
   */
  commit(): Promise<void>;
  /**
   * Roll back the transaction.
   */
  rollback(): Promise<void>;
}
declare namespace Transaction_2 {
  export { Options, IsolationLevel_2 as IsolationLevel, InteractiveTransactionInfo, TransactionHeaders };
}
declare type TransactionHeaders = {
  traceparent?: string;
};
declare type TransactionOptions = {
  usePhantomQuery: boolean;
};
declare type TransactionOptions_2<InteractiveTransactionPayload> = {
  kind: 'itx';
  options: InteractiveTransactionOptions<InteractiveTransactionPayload>;
} | {
  kind: 'batch';
  options: BatchTransactionOptions;
};
declare class TypedSql<Values extends readonly unknown[], Result> {
  [PrivateResultType]: Result$1;
  constructor(sql: string, values: Values);
  get sql(): string;
  get values(): Values;
}
declare type TypeMapCbDef = Fn<{
  extArgs: InternalArgs;
}, TypeMapDef>;
/** Shared */
declare type TypeMapDef = Record<any, any>;
declare type TypeRef<AllowedLocations extends FieldLocation> = {
  isList: boolean;
  type: string;
  location: AllowedLocations;
  namespace?: FieldNamespace;
};
declare namespace Types {
  export { Result_3 as Result, Extensions_2 as Extensions, Utils, Public_2 as Public, isSkip, Skip, skip, UnknownTypedSql, OperationPayload as Payload };
}
declare type uniqueIndex = ReadonlyDeep_2<{
  name: string;
  fields: string[];
}>;
declare type UnknownErrorParams = {
  clientVersion: string;
  batchRequestIdx?: number;
};
declare type UnknownTypedSql = TypedSql<unknown[], unknown>;
declare type Unpacker = (data: any) => any;
declare type UnwrapPayload<P> = {} extends P ? unknown : { [K in keyof P]: P[K] extends {
  scalars: infer S;
  composites: infer C;
}[] ? Array<S & UnwrapPayload<C>> : P[K] extends {
  scalars: infer S;
  composites: infer C;
} | null ? S & UnwrapPayload<C> | Select<P[K], null> : never };
declare type UnwrapPromise<P> = P extends Promise<infer R> ? R : P;
declare type UnwrapTuple<Tuple extends readonly unknown[]> = { [K in keyof Tuple]: K extends `${number}` ? Tuple[K] extends PrismaPromise<infer X> ? X : UnwrapPromise<Tuple[K]> : UnwrapPromise<Tuple[K]> };
/**
 * Input that flows from the user into the Client.
 */
declare type UserArgs_2 = any;
declare namespace Utils {
  export { EmptyToUnknown, NeverToUnknown, PatchFlat, Omit_2 as Omit, Pick_2 as Pick, ComputeDeep, Compute, OptionalFlat$1 as OptionalFlat, ReadonlyDeep, Narrowable, Narrow, Exact, Cast, Record_2 as Record, UnwrapPromise, UnwrapTuple, Path, Fn, Call, RequiredKeys$1 as RequiredKeys, OptionalKeys, Optional, Return, ToTuple, RenameAndNestPayloadKeys, PayloadToResult, Select, Equals, Or$1 as Or, JsPromise };
}
declare function validator<V>(): <S>(select: Exact<S, V>) => S;
declare function validator<C, M extends Exclude<keyof C, `$${string}`>, O extends keyof C[M] & Operation>(client: C, model: M, operation: O): <S>(select: Exact<S, Args<C[M], O>>) => S;
declare function validator<C, M extends Exclude<keyof C, `$${string}`>, O extends keyof C[M] & Operation, P extends keyof Args<C[M], O>>(client: C, model: M, operation: O, prop: P): <S>(select: Exact<S, Args<C[M], O>[P]>) => S;

/**
 * Values supported by SQL engine.
 */
declare type Value = unknown;
declare function warnEnvConflicts(envPaths: any): void;
declare const warnOnce: (key: string, message: string, ...args: unknown[]) => void;
/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
declare class PrismaClient<ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, const U = ('log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never), ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
  [K: symbol]: {
    types: Prisma.TypeMap<ExtArgs>['other'];
  };

  /**
  * ##  Prisma Client ʲˢ
  *
  * Type-safe database client for TypeScript & Node.js
  * @example
  * ```
  * const prisma = new PrismaClient()
  * // Fetch zero or more Users
  * const users = await prisma.user.findMany()
  * ```
  *
  *
  * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
  */

  constructor(optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
     * Executes a prepared raw query and returns the number of affected rows.
     * @example
     * ```
     * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
     * ```
     *
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
     */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: {
    isolationLevel?: Prisma.TransactionIsolationLevel;
  }): $Utils.JsPromise<Types.Utils.UnwrapTuple<P>>;
  $transaction<R>(fn: (prisma: Omit<PrismaClient, ITXClientDenyList>) => $Utils.JsPromise<R>, options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  }): $Utils.JsPromise<R>;
  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs;
  }>>;
}
declare namespace Prisma {
  export import DMMF = runtime.DMMF;
  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;
  export type DecimalJsLike = DecimalJsLike;

  /**
   * Metrics
   */
  export type Metrics = Metrics;
  export type Metric<T> = Metric<T>;
  export type MetricHistogram = MetricHistogram;
  export type MetricHistogramBucket = MetricHistogramBucket;

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 6.17.0
   * Query Engine version: c0aafc03b8ef6cdced8654b9a817999e02457d6a
   */
  export type PrismaVersion = {
    client: string;
  };
  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;
  type SelectAndInclude = {
    select: any;
    include: any;
  };
  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = { [P in K]: T[P] };
  export type Enumerable<T> = T | Array<T>;
  export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K }[keyof T];
  export type TruthyKeys<T> = keyof { [K in keyof T as T[K] extends false | undefined | null ? never : K]: K };
  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = { [key in keyof T]: key extends keyof U ? T[key] : never };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = { [key in keyof T]: key extends keyof U ? T[key] : never } & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = { [key in keyof T]: key extends keyof U ? T[key] : never } & K;
  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> & {
    // Merge all but K
  [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
  }[K];
  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];
  type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
  export type Union = any;
  type PatchUndefined<O extends object, O1 extends object> = { [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K] } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
  export type Overwrite<O extends object, O1 extends object> = { [K in keyof O]: K extends keyof O1 ? O1[K] : O[K] } & {};
  type _Merge<U extends object> = IntersectOf<Overwrite<U, { [K in keyof U]-?: At<U, K> }>>;
  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];
  export type ComputeRaw<A extends any> = A extends Function ? A : { [K in keyof A]: A[K] } & {};
  export type OptionalFlat<O> = { [K in keyof O]?: O[K] } & {};
  type _Record<K extends keyof any, T> = { [P in K]: T };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? { [P in K]: O[P] } & O : O) | { [P in keyof O as P extends K ? P : never]-?: O[P] } & O : never>;
  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;
  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];
  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 // anything `never` is false
  : A1 extends A2 ? 1 : 0;
  export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];
  export type Keys<U extends Union> = U extends unknown ? keyof U : never;
  type Cast<A, B> = A extends B ? A : B;
  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? { [P in keyof T]: P extends keyof O ? O[P] : never } : never;
  type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
  type GetHavingFields<T> = { [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ?
  // infer is only needed to not hit TS limit
  // based on the brilliant idea of Pierre-Antoine Mills
  // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
  T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
  export type FieldRef<Model, FieldType> = FieldRef$1<Model, FieldType>;
  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
  export const ModelName: {};
  export type ModelName = (typeof ModelName)[keyof typeof ModelName];
  export type Datasources = {
    db?: Datasource;
  };
  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{
    extArgs: $Extensions.InternalArgs;
  }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends {
      omit: infer OmitOptions;
    } ? OmitOptions : {}>;
  }
  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions;
    };
    meta: {
      modelProps: never;
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {};
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: SqlDriverAdapterFactory | null;
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig;
  }
  export type GlobalOmitConfig = {};

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error';
  export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
  };
  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
  export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };
  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, ITXClientDenyList>;
  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Models
   */

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted';
    ReadCommitted: 'ReadCommitted';
    RepeatableRead: 'RepeatableRead';
    Serializable: 'Serializable';
  };
  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  /**
   * Deep Input Types
   */

  undefined;

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: BaseDMMF;
}
//#endregion
//#region src/prisma-provider.d.ts
declare class PrismaProvider implements DatabaseContract {
  #private;
  private client;
  constructor(client: PrismaClient);
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
  findAccountById<T>({
    id
  }: {
    id: string;
  }): Promise<T>;
  findAccountWithCredential({
    ...args
  }: {
    email?: string;
    phoneNumber?: string;
    select?: any;
  }): Promise<any>;
  createAccount({
    ...args
  }: {
    data: any;
    select?: any;
  }): Promise<any>;
  removeAndAddRefreshToken<T>({
    id,
    refreshToken,
    select,
    newRefreshToken
  }: {
    id: string;
    refreshToken: string;
    select?: any;
    newRefreshToken?: string;
  }): Promise<T>;
  updateAccountLogin({
    ...args
  }: {
    id: string;
    refreshToken: string;
    select?: any;
  }): Promise<any>;
  updateAccount({
    ...args
  }: {
    id: string;
    data: any;
  }): Promise<any>;
  deleteAccount({
    id
  }: {
    id: string;
  }): Promise<any>;
}
//#endregion
export { PrismaProvider };