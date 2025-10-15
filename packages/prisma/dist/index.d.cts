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
declare const OtpSchema: z$1.ZodObject<{
  id: z$1.ZodString;
  auth: z$1.ZodOptional<z$1.ZodObject<{
    id: z$1.ZodString;
    phoneNumber: z$1.ZodString;
    email: z$1.ZodString;
    passwordHash: z$1.ZodOptional<z$1.ZodString>;
    role: z$1.ZodString;
    lastLogin: z$1.ZodDate;
    refreshTokens: z$1.ZodOptional<z$1.ZodArray<z$1.ZodString>>;
    createdAt: z$1.ZodDate;
    updatedAt: z$1.ZodDate;
  }, z$1.z.core.$strip>>;
  code: z$1.ZodString;
  purpose: z$1.ZodString;
  expiresAt: z$1.ZodDate;
  createdAt: z$1.ZodDate;
  updatedAt: z$1.ZodDate;
}, z$1.z.core.$strip>;
type OtpType = z$1.infer<typeof OtpSchema>;
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
  createOTP<T = OtpType>({
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
  phoneNumber: z.ZodNever;
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
  export { datamodelEnumToSchemaEnum, Document_2 as Document, Mappings, OtherOperationMappings, DatamodelEnum, SchemaEnum, EnumValue, Datamodel, uniqueIndex, PrimaryKey, Model$1 as Model, FieldKind, FieldNamespace, FieldLocation, Field, FieldDefault, FieldDefaultScalar, Index, IndexType, IndexField, SortOrder$1 as SortOrder, Schema, Query, QueryOutput, TypeRef, InputTypeRef, SchemaArg, OutputType, SchemaField, OutputTypeRef, Deprecation, InputType, FieldRefType, FieldRefAllowType, ModelMapping, ModelAction };
}
declare namespace DMMF_2 {
  export { datamodelEnumToSchemaEnum, Document_2 as Document, Mappings, OtherOperationMappings, DatamodelEnum, SchemaEnum, EnumValue, Datamodel, uniqueIndex, PrimaryKey, Model$1 as Model, FieldKind, FieldNamespace, FieldLocation, Field, FieldDefault, FieldDefaultScalar, Index, IndexType, IndexField, SortOrder$1 as SortOrder, Schema, Query, QueryOutput, TypeRef, InputTypeRef, SchemaArg, OutputType, SchemaField, OutputTypeRef, Deprecation, InputType, FieldRefType, FieldRefAllowType, ModelMapping, ModelAction };
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
  sortOrder?: SortOrder$1;
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
declare type SortOrder$1 = 'asc' | 'desc';

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
 * Enums
 */
declare namespace $Enums {
  export const OtpPurpose: {
    LOGIN: 'LOGIN';
    RESET_PASSWORD: 'RESET_PASSWORD';
    ACTION: 'ACTION';
  };
  export type OtpPurpose = (typeof OtpPurpose$1)[keyof typeof OtpPurpose$1];
}
type OtpPurpose$1 = $Enums.OtpPurpose;
declare const OtpPurpose$1: typeof $Enums.OtpPurpose;
/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Auths
 * const auths = await prisma.auth.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
declare class PrismaClient<ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions, U = ('log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never), ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
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
  * // Fetch zero or more Auths
  * const auths = await prisma.auth.findMany()
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
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void;

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

  /**
  * `prisma.auth`: Exposes CRUD operations for the **Auth** model.
  * Example usage:
  * ```ts
  * // Fetch zero or more Auths
  * const auths = await prisma.auth.findMany()
  * ```
  */
  get auth(): Prisma.AuthDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.otp`: Exposes CRUD operations for the **Otp** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Otps
    * const otps = await prisma.otp.findMany()
    * ```
    */
  get otp(): Prisma.OtpDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.11.1
   * Query Engine version: f40f79ec31188888a2e33acda0ecc8fd10a853a9
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
  export const ModelName: {
    Auth: 'Auth';
    Otp: 'Otp';
  };
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
      modelProps: "auth" | "otp";
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      Auth: {
        payload: Prisma.$AuthPayload<ExtArgs>;
        fields: Prisma.AuthFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.AuthFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuthPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.AuthFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuthPayload>;
          };
          findFirst: {
            args: Prisma.AuthFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuthPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.AuthFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuthPayload>;
          };
          findMany: {
            args: Prisma.AuthFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuthPayload>[];
          };
          create: {
            args: Prisma.AuthCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuthPayload>;
          };
          createMany: {
            args: Prisma.AuthCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.AuthCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuthPayload>[];
          };
          delete: {
            args: Prisma.AuthDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuthPayload>;
          };
          update: {
            args: Prisma.AuthUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuthPayload>;
          };
          deleteMany: {
            args: Prisma.AuthDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.AuthUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.AuthUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuthPayload>[];
          };
          upsert: {
            args: Prisma.AuthUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$AuthPayload>;
          };
          aggregate: {
            args: Prisma.AuthAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateAuth>;
          };
          groupBy: {
            args: Prisma.AuthGroupByArgs<ExtArgs>;
            result: $Utils.Optional<AuthGroupByOutputType>[];
          };
          count: {
            args: Prisma.AuthCountArgs<ExtArgs>;
            result: $Utils.Optional<AuthCountAggregateOutputType> | number;
          };
        };
      };
      Otp: {
        payload: Prisma.$OtpPayload<ExtArgs>;
        fields: Prisma.OtpFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.OtpFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OtpPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.OtpFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OtpPayload>;
          };
          findFirst: {
            args: Prisma.OtpFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OtpPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.OtpFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OtpPayload>;
          };
          findMany: {
            args: Prisma.OtpFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OtpPayload>[];
          };
          create: {
            args: Prisma.OtpCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OtpPayload>;
          };
          createMany: {
            args: Prisma.OtpCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.OtpCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OtpPayload>[];
          };
          delete: {
            args: Prisma.OtpDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OtpPayload>;
          };
          update: {
            args: Prisma.OtpUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OtpPayload>;
          };
          deleteMany: {
            args: Prisma.OtpDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.OtpUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.OtpUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OtpPayload>[];
          };
          upsert: {
            args: Prisma.OtpUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$OtpPayload>;
          };
          aggregate: {
            args: Prisma.OtpAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateOtp>;
          };
          groupBy: {
            args: Prisma.OtpGroupByArgs<ExtArgs>;
            result: $Utils.Optional<OtpGroupByOutputType>[];
          };
          count: {
            args: Prisma.OtpCountArgs<ExtArgs>;
            result: $Utils.Optional<OtpCountAggregateOutputType> | number;
          };
        };
      };
    };
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
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
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
  export type GlobalOmitConfig = {
    auth?: AuthOmit;
    otp?: OtpOmit;
  };

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error';
  export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
  };
  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never;
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]> : never;
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

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName;
    action: PrismaAction;
    args: any;
    dataPath: string[];
    runInTransaction: boolean;
  };

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (params: MiddlewareParams, next: (params: MiddlewareParams) => $Utils.JsPromise<T>) => $Utils.JsPromise<T>;

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
   * Model Auth
   */

  export type AggregateAuth = {
    _count: AuthCountAggregateOutputType | null;
    _min: AuthMinAggregateOutputType | null;
    _max: AuthMaxAggregateOutputType | null;
  };
  export type AuthMinAggregateOutputType = {
    id: string | null;
    phoneNumber: string | null;
    email: string | null;
    passwordHash: string | null;
    role: string | null;
    lastLogin: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    otpId: string | null;
  };
  export type AuthMaxAggregateOutputType = {
    id: string | null;
    phoneNumber: string | null;
    email: string | null;
    passwordHash: string | null;
    role: string | null;
    lastLogin: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    otpId: string | null;
  };
  export type AuthCountAggregateOutputType = {
    id: number;
    phoneNumber: number;
    email: number;
    passwordHash: number;
    role: number;
    lastLogin: number;
    refreshTokens: number;
    createdAt: number;
    updatedAt: number;
    otpId: number;
    _all: number;
  };
  export type AuthMinAggregateInputType = {
    id?: true;
    phoneNumber?: true;
    email?: true;
    passwordHash?: true;
    role?: true;
    lastLogin?: true;
    createdAt?: true;
    updatedAt?: true;
    otpId?: true;
  };
  export type AuthMaxAggregateInputType = {
    id?: true;
    phoneNumber?: true;
    email?: true;
    passwordHash?: true;
    role?: true;
    lastLogin?: true;
    createdAt?: true;
    updatedAt?: true;
    otpId?: true;
  };
  export type AuthCountAggregateInputType = {
    id?: true;
    phoneNumber?: true;
    email?: true;
    passwordHash?: true;
    role?: true;
    lastLogin?: true;
    refreshTokens?: true;
    createdAt?: true;
    updatedAt?: true;
    otpId?: true;
    _all?: true;
  };
  export type AuthAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Auth to aggregate.
     */
    where?: AuthWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Auths to fetch.
     */
    orderBy?: AuthOrderByWithRelationInput | AuthOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuthWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Auths from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Auths.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Auths
    **/
    _count?: true | AuthCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuthMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuthMaxAggregateInputType;
  };
  export type GetAuthAggregateType<T extends AuthAggregateArgs> = { [P in keyof T & keyof AggregateAuth]: P extends '_count' | 'count' ? T[P] extends true ? number : GetScalarType<T[P], AggregateAuth[P]> : GetScalarType<T[P], AggregateAuth[P]> };
  export type AuthGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthWhereInput;
    orderBy?: AuthOrderByWithAggregationInput | AuthOrderByWithAggregationInput[];
    by: AuthScalarFieldEnum[] | AuthScalarFieldEnum;
    having?: AuthScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: AuthCountAggregateInputType | true;
    _min?: AuthMinAggregateInputType;
    _max?: AuthMaxAggregateInputType;
  };
  export type AuthGroupByOutputType = {
    id: string;
    phoneNumber: string | null;
    email: string | null;
    passwordHash: string;
    role: string;
    lastLogin: Date;
    refreshTokens: string[];
    createdAt: Date;
    updatedAt: Date;
    otpId: string;
    _count: AuthCountAggregateOutputType | null;
    _min: AuthMinAggregateOutputType | null;
    _max: AuthMaxAggregateOutputType | null;
  };
  type GetAuthGroupByPayload<T extends AuthGroupByArgs> = Prisma.PrismaPromise<Array<PickEnumerable<AuthGroupByOutputType, T['by']> & { [P in ((keyof T) & (keyof AuthGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : GetScalarType<T[P], AuthGroupByOutputType[P]> : GetScalarType<T[P], AuthGroupByOutputType[P]> }>>;
  export type AuthSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean;
    phoneNumber?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    role?: boolean;
    lastLogin?: boolean;
    refreshTokens?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    otpId?: boolean;
    otp?: boolean | Auth$otpArgs<ExtArgs>;
  }, ExtArgs["result"]["auth"]>;
  export type AuthSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean;
    phoneNumber?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    role?: boolean;
    lastLogin?: boolean;
    refreshTokens?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    otpId?: boolean;
  }, ExtArgs["result"]["auth"]>;
  export type AuthSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean;
    phoneNumber?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    role?: boolean;
    lastLogin?: boolean;
    refreshTokens?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    otpId?: boolean;
  }, ExtArgs["result"]["auth"]>;
  export type AuthSelectScalar = {
    id?: boolean;
    phoneNumber?: boolean;
    email?: boolean;
    passwordHash?: boolean;
    role?: boolean;
    lastLogin?: boolean;
    refreshTokens?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    otpId?: boolean;
  };
  export type AuthOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "phoneNumber" | "email" | "passwordHash" | "role" | "lastLogin" | "refreshTokens" | "createdAt" | "updatedAt" | "otpId", ExtArgs["result"]["auth"]>;
  export type AuthInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    otp?: boolean | Auth$otpArgs<ExtArgs>;
  };
  export type AuthIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {};
  export type AuthIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {};
  export type $AuthPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Auth";
    objects: {
      otp: Prisma.$OtpPayload<ExtArgs> | null;
    };
    scalars: $Extensions.GetPayloadResult<{
      id: string;
      phoneNumber: string | null;
      email: string | null;
      passwordHash: string;
      role: string;
      lastLogin: Date;
      refreshTokens: string[];
      createdAt: Date;
      updatedAt: Date;
      otpId: string;
    }, ExtArgs["result"]["auth"]>;
    composites: {};
  };
  type AuthGetPayload<S extends boolean | null | undefined | AuthDefaultArgs> = $Result.GetResult<Prisma.$AuthPayload, S>;
  type AuthCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<AuthFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: AuthCountAggregateInputType | true;
  };
  export interface AuthDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Auth'];
      meta: {
        name: 'Auth';
      };
    };
    /**
     * Find zero or one Auth that matches the filter.
     * @param {AuthFindUniqueArgs} args - Arguments to find a Auth
     * @example
     * // Get one Auth
     * const auth = await prisma.auth.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuthFindUniqueArgs>(args: SelectSubset<T, AuthFindUniqueArgs<ExtArgs>>): Prisma__AuthClient<$Result.GetResult<Prisma.$AuthPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;

    /**
     * Find one Auth that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AuthFindUniqueOrThrowArgs} args - Arguments to find a Auth
     * @example
     * // Get one Auth
     * const auth = await prisma.auth.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuthFindUniqueOrThrowArgs>(args: SelectSubset<T, AuthFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuthClient<$Result.GetResult<Prisma.$AuthPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;

    /**
     * Find the first Auth that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthFindFirstArgs} args - Arguments to find a Auth
     * @example
     * // Get one Auth
     * const auth = await prisma.auth.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuthFindFirstArgs>(args?: SelectSubset<T, AuthFindFirstArgs<ExtArgs>>): Prisma__AuthClient<$Result.GetResult<Prisma.$AuthPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;

    /**
     * Find the first Auth that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthFindFirstOrThrowArgs} args - Arguments to find a Auth
     * @example
     * // Get one Auth
     * const auth = await prisma.auth.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuthFindFirstOrThrowArgs>(args?: SelectSubset<T, AuthFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuthClient<$Result.GetResult<Prisma.$AuthPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;

    /**
     * Find zero or more Auths that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Auths
     * const auths = await prisma.auth.findMany()
     * 
     * // Get first 10 Auths
     * const auths = await prisma.auth.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const authWithIdOnly = await prisma.auth.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuthFindManyArgs>(args?: SelectSubset<T, AuthFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;

    /**
     * Create a Auth.
     * @param {AuthCreateArgs} args - Arguments to create a Auth.
     * @example
     * // Create one Auth
     * const Auth = await prisma.auth.create({
     *   data: {
     *     // ... data to create a Auth
     *   }
     * })
     * 
     */
    create<T extends AuthCreateArgs>(args: SelectSubset<T, AuthCreateArgs<ExtArgs>>): Prisma__AuthClient<$Result.GetResult<Prisma.$AuthPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;

    /**
     * Create many Auths.
     * @param {AuthCreateManyArgs} args - Arguments to create many Auths.
     * @example
     * // Create many Auths
     * const auth = await prisma.auth.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuthCreateManyArgs>(args?: SelectSubset<T, AuthCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Auths and returns the data saved in the database.
     * @param {AuthCreateManyAndReturnArgs} args - Arguments to create many Auths.
     * @example
     * // Create many Auths
     * const auth = await prisma.auth.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Auths and only return the `id`
     * const authWithIdOnly = await prisma.auth.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuthCreateManyAndReturnArgs>(args?: SelectSubset<T, AuthCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;

    /**
     * Delete a Auth.
     * @param {AuthDeleteArgs} args - Arguments to delete one Auth.
     * @example
     * // Delete one Auth
     * const Auth = await prisma.auth.delete({
     *   where: {
     *     // ... filter to delete one Auth
     *   }
     * })
     * 
     */
    delete<T extends AuthDeleteArgs>(args: SelectSubset<T, AuthDeleteArgs<ExtArgs>>): Prisma__AuthClient<$Result.GetResult<Prisma.$AuthPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;

    /**
     * Update one Auth.
     * @param {AuthUpdateArgs} args - Arguments to update one Auth.
     * @example
     * // Update one Auth
     * const auth = await prisma.auth.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuthUpdateArgs>(args: SelectSubset<T, AuthUpdateArgs<ExtArgs>>): Prisma__AuthClient<$Result.GetResult<Prisma.$AuthPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;

    /**
     * Delete zero or more Auths.
     * @param {AuthDeleteManyArgs} args - Arguments to filter Auths to delete.
     * @example
     * // Delete a few Auths
     * const { count } = await prisma.auth.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuthDeleteManyArgs>(args?: SelectSubset<T, AuthDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Auths.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Auths
     * const auth = await prisma.auth.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuthUpdateManyArgs>(args: SelectSubset<T, AuthUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Auths and returns the data updated in the database.
     * @param {AuthUpdateManyAndReturnArgs} args - Arguments to update many Auths.
     * @example
     * // Update many Auths
     * const auth = await prisma.auth.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Auths and only return the `id`
     * const authWithIdOnly = await prisma.auth.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AuthUpdateManyAndReturnArgs>(args: SelectSubset<T, AuthUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;

    /**
     * Create or update one Auth.
     * @param {AuthUpsertArgs} args - Arguments to update or create a Auth.
     * @example
     * // Update or create a Auth
     * const auth = await prisma.auth.upsert({
     *   create: {
     *     // ... data to create a Auth
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Auth we want to update
     *   }
     * })
     */
    upsert<T extends AuthUpsertArgs>(args: SelectSubset<T, AuthUpsertArgs<ExtArgs>>): Prisma__AuthClient<$Result.GetResult<Prisma.$AuthPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;

    /**
     * Count the number of Auths.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthCountArgs} args - Arguments to filter Auths to count.
     * @example
     * // Count the number of Auths
     * const count = await prisma.auth.count({
     *   where: {
     *     // ... the filter for the Auths we want to count
     *   }
     * })
    **/
    count<T extends AuthCountArgs>(args?: Subset<T, AuthCountArgs>): Prisma.PrismaPromise<T extends $Utils.Record<'select', any> ? T['select'] extends true ? number : GetScalarType<T['select'], AuthCountAggregateOutputType> : number>;

    /**
     * Allows you to perform aggregations operations on a Auth.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuthAggregateArgs>(args: Subset<T, AuthAggregateArgs>): Prisma.PrismaPromise<GetAuthAggregateType<T>>;

    /**
     * Group by Auth.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<T extends AuthGroupByArgs, HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>, OrderByArg extends (True extends HasSelectOrTake ? {
      orderBy: AuthGroupByArgs['orderBy'];
    } : {
      orderBy?: AuthGroupByArgs['orderBy'];
    }), OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>, ByFields extends MaybeTupleToUnion<T['by']>, ByValid extends Has<ByFields, OrderFields>, HavingFields extends GetHavingFields<T['having']>, HavingValid extends Has<ByFields, HavingFields>, ByEmpty extends (T['by'] extends never[] ? True : False), InputErrors extends (ByEmpty extends True ? `Error: "by" must not be empty.` : HavingValid extends False ? { [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`] }[HavingFields] : 'take' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields])>(args: SubsetIntersection<T, AuthGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Auth model
     */
    readonly fields: AuthFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Auth.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuthClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    otp<T extends Auth$otpArgs<ExtArgs> = {}>(args?: Subset<T, Auth$otpArgs<ExtArgs>>): Prisma__OtpClient<$Result.GetResult<Prisma.$OtpPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Auth model
   */
  interface AuthFieldRefs {
    readonly id: FieldRef<"Auth", 'String'>;
    readonly phoneNumber: FieldRef<"Auth", 'String'>;
    readonly email: FieldRef<"Auth", 'String'>;
    readonly passwordHash: FieldRef<"Auth", 'String'>;
    readonly role: FieldRef<"Auth", 'String'>;
    readonly lastLogin: FieldRef<"Auth", 'DateTime'>;
    readonly refreshTokens: FieldRef<"Auth", 'String[]'>;
    readonly createdAt: FieldRef<"Auth", 'DateTime'>;
    readonly updatedAt: FieldRef<"Auth", 'DateTime'>;
    readonly otpId: FieldRef<"Auth", 'String'>;
  }

  // Custom InputTypes
  /**
   * Auth findUnique
   */
  export type AuthFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Auth
     */
    select?: AuthSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Auth
     */
    omit?: AuthOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthInclude<ExtArgs> | null;
    /**
     * Filter, which Auth to fetch.
     */
    where: AuthWhereUniqueInput;
  };

  /**
   * Auth findUniqueOrThrow
   */
  export type AuthFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Auth
     */
    select?: AuthSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Auth
     */
    omit?: AuthOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthInclude<ExtArgs> | null;
    /**
     * Filter, which Auth to fetch.
     */
    where: AuthWhereUniqueInput;
  };

  /**
   * Auth findFirst
   */
  export type AuthFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Auth
     */
    select?: AuthSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Auth
     */
    omit?: AuthOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthInclude<ExtArgs> | null;
    /**
     * Filter, which Auth to fetch.
     */
    where?: AuthWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Auths to fetch.
     */
    orderBy?: AuthOrderByWithRelationInput | AuthOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Auths.
     */
    cursor?: AuthWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Auths from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Auths.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Auths.
     */
    distinct?: AuthScalarFieldEnum | AuthScalarFieldEnum[];
  };

  /**
   * Auth findFirstOrThrow
   */
  export type AuthFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Auth
     */
    select?: AuthSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Auth
     */
    omit?: AuthOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthInclude<ExtArgs> | null;
    /**
     * Filter, which Auth to fetch.
     */
    where?: AuthWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Auths to fetch.
     */
    orderBy?: AuthOrderByWithRelationInput | AuthOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Auths.
     */
    cursor?: AuthWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Auths from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Auths.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Auths.
     */
    distinct?: AuthScalarFieldEnum | AuthScalarFieldEnum[];
  };

  /**
   * Auth findMany
   */
  export type AuthFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Auth
     */
    select?: AuthSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Auth
     */
    omit?: AuthOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthInclude<ExtArgs> | null;
    /**
     * Filter, which Auths to fetch.
     */
    where?: AuthWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Auths to fetch.
     */
    orderBy?: AuthOrderByWithRelationInput | AuthOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Auths.
     */
    cursor?: AuthWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Auths from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Auths.
     */
    skip?: number;
    distinct?: AuthScalarFieldEnum | AuthScalarFieldEnum[];
  };

  /**
   * Auth create
   */
  export type AuthCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Auth
     */
    select?: AuthSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Auth
     */
    omit?: AuthOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthInclude<ExtArgs> | null;
    /**
     * The data needed to create a Auth.
     */
    data: XOR<AuthCreateInput, AuthUncheckedCreateInput>;
  };

  /**
   * Auth createMany
   */
  export type AuthCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Auths.
     */
    data: AuthCreateManyInput | AuthCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Auth createManyAndReturn
   */
  export type AuthCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Auth
     */
    select?: AuthSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Auth
     */
    omit?: AuthOmit<ExtArgs> | null;
    /**
     * The data used to create many Auths.
     */
    data: AuthCreateManyInput | AuthCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Auth update
   */
  export type AuthUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Auth
     */
    select?: AuthSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Auth
     */
    omit?: AuthOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthInclude<ExtArgs> | null;
    /**
     * The data needed to update a Auth.
     */
    data: XOR<AuthUpdateInput, AuthUncheckedUpdateInput>;
    /**
     * Choose, which Auth to update.
     */
    where: AuthWhereUniqueInput;
  };

  /**
   * Auth updateMany
   */
  export type AuthUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Auths.
     */
    data: XOR<AuthUpdateManyMutationInput, AuthUncheckedUpdateManyInput>;
    /**
     * Filter which Auths to update
     */
    where?: AuthWhereInput;
    /**
     * Limit how many Auths to update.
     */
    limit?: number;
  };

  /**
   * Auth updateManyAndReturn
   */
  export type AuthUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Auth
     */
    select?: AuthSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Auth
     */
    omit?: AuthOmit<ExtArgs> | null;
    /**
     * The data used to update Auths.
     */
    data: XOR<AuthUpdateManyMutationInput, AuthUncheckedUpdateManyInput>;
    /**
     * Filter which Auths to update
     */
    where?: AuthWhereInput;
    /**
     * Limit how many Auths to update.
     */
    limit?: number;
  };

  /**
   * Auth upsert
   */
  export type AuthUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Auth
     */
    select?: AuthSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Auth
     */
    omit?: AuthOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthInclude<ExtArgs> | null;
    /**
     * The filter to search for the Auth to update in case it exists.
     */
    where: AuthWhereUniqueInput;
    /**
     * In case the Auth found by the `where` argument doesn't exist, create a new Auth with this data.
     */
    create: XOR<AuthCreateInput, AuthUncheckedCreateInput>;
    /**
     * In case the Auth was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuthUpdateInput, AuthUncheckedUpdateInput>;
  };

  /**
   * Auth delete
   */
  export type AuthDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Auth
     */
    select?: AuthSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Auth
     */
    omit?: AuthOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthInclude<ExtArgs> | null;
    /**
     * Filter which Auth to delete.
     */
    where: AuthWhereUniqueInput;
  };

  /**
   * Auth deleteMany
   */
  export type AuthDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Auths to delete
     */
    where?: AuthWhereInput;
    /**
     * Limit how many Auths to delete.
     */
    limit?: number;
  };

  /**
   * Auth.otp
   */
  export type Auth$otpArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpInclude<ExtArgs> | null;
    where?: OtpWhereInput;
  };

  /**
   * Auth without action
   */
  export type AuthDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Auth
     */
    select?: AuthSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Auth
     */
    omit?: AuthOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthInclude<ExtArgs> | null;
  };

  /**
   * Model Otp
   */

  export type AggregateOtp = {
    _count: OtpCountAggregateOutputType | null;
    _min: OtpMinAggregateOutputType | null;
    _max: OtpMaxAggregateOutputType | null;
  };
  export type OtpMinAggregateOutputType = {
    id: string | null;
    code: string | null;
    purpose: $Enums.OtpPurpose | null;
    expiresAt: Date | null;
    isUsed: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
  export type OtpMaxAggregateOutputType = {
    id: string | null;
    code: string | null;
    purpose: $Enums.OtpPurpose | null;
    expiresAt: Date | null;
    isUsed: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };
  export type OtpCountAggregateOutputType = {
    id: number;
    code: number;
    purpose: number;
    expiresAt: number;
    isUsed: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };
  export type OtpMinAggregateInputType = {
    id?: true;
    code?: true;
    purpose?: true;
    expiresAt?: true;
    isUsed?: true;
    createdAt?: true;
    updatedAt?: true;
  };
  export type OtpMaxAggregateInputType = {
    id?: true;
    code?: true;
    purpose?: true;
    expiresAt?: true;
    isUsed?: true;
    createdAt?: true;
    updatedAt?: true;
  };
  export type OtpCountAggregateInputType = {
    id?: true;
    code?: true;
    purpose?: true;
    expiresAt?: true;
    isUsed?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };
  export type OtpAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Otp to aggregate.
     */
    where?: OtpWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Otps to fetch.
     */
    orderBy?: OtpOrderByWithRelationInput | OtpOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OtpWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Otps from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Otps.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Otps
    **/
    _count?: true | OtpCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OtpMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OtpMaxAggregateInputType;
  };
  export type GetOtpAggregateType<T extends OtpAggregateArgs> = { [P in keyof T & keyof AggregateOtp]: P extends '_count' | 'count' ? T[P] extends true ? number : GetScalarType<T[P], AggregateOtp[P]> : GetScalarType<T[P], AggregateOtp[P]> };
  export type OtpGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OtpWhereInput;
    orderBy?: OtpOrderByWithAggregationInput | OtpOrderByWithAggregationInput[];
    by: OtpScalarFieldEnum[] | OtpScalarFieldEnum;
    having?: OtpScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: OtpCountAggregateInputType | true;
    _min?: OtpMinAggregateInputType;
    _max?: OtpMaxAggregateInputType;
  };
  export type OtpGroupByOutputType = {
    id: string;
    code: string;
    purpose: $Enums.OtpPurpose;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: OtpCountAggregateOutputType | null;
    _min: OtpMinAggregateOutputType | null;
    _max: OtpMaxAggregateOutputType | null;
  };
  type GetOtpGroupByPayload<T extends OtpGroupByArgs> = Prisma.PrismaPromise<Array<PickEnumerable<OtpGroupByOutputType, T['by']> & { [P in ((keyof T) & (keyof OtpGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : GetScalarType<T[P], OtpGroupByOutputType[P]> : GetScalarType<T[P], OtpGroupByOutputType[P]> }>>;
  export type OtpSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    purpose?: boolean;
    expiresAt?: boolean;
    isUsed?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    auth?: boolean | AuthDefaultArgs<ExtArgs>;
  }, ExtArgs["result"]["otp"]>;
  export type OtpSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    purpose?: boolean;
    expiresAt?: boolean;
    isUsed?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    auth?: boolean | AuthDefaultArgs<ExtArgs>;
  }, ExtArgs["result"]["otp"]>;
  export type OtpSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean;
    code?: boolean;
    purpose?: boolean;
    expiresAt?: boolean;
    isUsed?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    auth?: boolean | AuthDefaultArgs<ExtArgs>;
  }, ExtArgs["result"]["otp"]>;
  export type OtpSelectScalar = {
    id?: boolean;
    code?: boolean;
    purpose?: boolean;
    expiresAt?: boolean;
    isUsed?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };
  export type OtpOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "code" | "purpose" | "expiresAt" | "isUsed" | "createdAt" | "updatedAt", ExtArgs["result"]["otp"]>;
  export type OtpInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    auth?: boolean | AuthDefaultArgs<ExtArgs>;
  };
  export type OtpIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    auth?: boolean | AuthDefaultArgs<ExtArgs>;
  };
  export type OtpIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    auth?: boolean | AuthDefaultArgs<ExtArgs>;
  };
  export type $OtpPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Otp";
    objects: {
      auth: Prisma.$AuthPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<{
      id: string;
      code: string;
      purpose: $Enums.OtpPurpose;
      expiresAt: Date;
      isUsed: boolean;
      createdAt: Date;
      updatedAt: Date;
    }, ExtArgs["result"]["otp"]>;
    composites: {};
  };
  type OtpGetPayload<S extends boolean | null | undefined | OtpDefaultArgs> = $Result.GetResult<Prisma.$OtpPayload, S>;
  type OtpCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<OtpFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: OtpCountAggregateInputType | true;
  };
  export interface OtpDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Otp'];
      meta: {
        name: 'Otp';
      };
    };
    /**
     * Find zero or one Otp that matches the filter.
     * @param {OtpFindUniqueArgs} args - Arguments to find a Otp
     * @example
     * // Get one Otp
     * const otp = await prisma.otp.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OtpFindUniqueArgs>(args: SelectSubset<T, OtpFindUniqueArgs<ExtArgs>>): Prisma__OtpClient<$Result.GetResult<Prisma.$OtpPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;

    /**
     * Find one Otp that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OtpFindUniqueOrThrowArgs} args - Arguments to find a Otp
     * @example
     * // Get one Otp
     * const otp = await prisma.otp.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OtpFindUniqueOrThrowArgs>(args: SelectSubset<T, OtpFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OtpClient<$Result.GetResult<Prisma.$OtpPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;

    /**
     * Find the first Otp that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpFindFirstArgs} args - Arguments to find a Otp
     * @example
     * // Get one Otp
     * const otp = await prisma.otp.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OtpFindFirstArgs>(args?: SelectSubset<T, OtpFindFirstArgs<ExtArgs>>): Prisma__OtpClient<$Result.GetResult<Prisma.$OtpPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;

    /**
     * Find the first Otp that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpFindFirstOrThrowArgs} args - Arguments to find a Otp
     * @example
     * // Get one Otp
     * const otp = await prisma.otp.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OtpFindFirstOrThrowArgs>(args?: SelectSubset<T, OtpFindFirstOrThrowArgs<ExtArgs>>): Prisma__OtpClient<$Result.GetResult<Prisma.$OtpPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;

    /**
     * Find zero or more Otps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Otps
     * const otps = await prisma.otp.findMany()
     * 
     * // Get first 10 Otps
     * const otps = await prisma.otp.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const otpWithIdOnly = await prisma.otp.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OtpFindManyArgs>(args?: SelectSubset<T, OtpFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OtpPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;

    /**
     * Create a Otp.
     * @param {OtpCreateArgs} args - Arguments to create a Otp.
     * @example
     * // Create one Otp
     * const Otp = await prisma.otp.create({
     *   data: {
     *     // ... data to create a Otp
     *   }
     * })
     * 
     */
    create<T extends OtpCreateArgs>(args: SelectSubset<T, OtpCreateArgs<ExtArgs>>): Prisma__OtpClient<$Result.GetResult<Prisma.$OtpPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;

    /**
     * Create many Otps.
     * @param {OtpCreateManyArgs} args - Arguments to create many Otps.
     * @example
     * // Create many Otps
     * const otp = await prisma.otp.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OtpCreateManyArgs>(args?: SelectSubset<T, OtpCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Otps and returns the data saved in the database.
     * @param {OtpCreateManyAndReturnArgs} args - Arguments to create many Otps.
     * @example
     * // Create many Otps
     * const otp = await prisma.otp.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Otps and only return the `id`
     * const otpWithIdOnly = await prisma.otp.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OtpCreateManyAndReturnArgs>(args?: SelectSubset<T, OtpCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OtpPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;

    /**
     * Delete a Otp.
     * @param {OtpDeleteArgs} args - Arguments to delete one Otp.
     * @example
     * // Delete one Otp
     * const Otp = await prisma.otp.delete({
     *   where: {
     *     // ... filter to delete one Otp
     *   }
     * })
     * 
     */
    delete<T extends OtpDeleteArgs>(args: SelectSubset<T, OtpDeleteArgs<ExtArgs>>): Prisma__OtpClient<$Result.GetResult<Prisma.$OtpPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;

    /**
     * Update one Otp.
     * @param {OtpUpdateArgs} args - Arguments to update one Otp.
     * @example
     * // Update one Otp
     * const otp = await prisma.otp.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OtpUpdateArgs>(args: SelectSubset<T, OtpUpdateArgs<ExtArgs>>): Prisma__OtpClient<$Result.GetResult<Prisma.$OtpPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;

    /**
     * Delete zero or more Otps.
     * @param {OtpDeleteManyArgs} args - Arguments to filter Otps to delete.
     * @example
     * // Delete a few Otps
     * const { count } = await prisma.otp.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OtpDeleteManyArgs>(args?: SelectSubset<T, OtpDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Otps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Otps
     * const otp = await prisma.otp.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OtpUpdateManyArgs>(args: SelectSubset<T, OtpUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Otps and returns the data updated in the database.
     * @param {OtpUpdateManyAndReturnArgs} args - Arguments to update many Otps.
     * @example
     * // Update many Otps
     * const otp = await prisma.otp.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Otps and only return the `id`
     * const otpWithIdOnly = await prisma.otp.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OtpUpdateManyAndReturnArgs>(args: SelectSubset<T, OtpUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OtpPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;

    /**
     * Create or update one Otp.
     * @param {OtpUpsertArgs} args - Arguments to update or create a Otp.
     * @example
     * // Update or create a Otp
     * const otp = await prisma.otp.upsert({
     *   create: {
     *     // ... data to create a Otp
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Otp we want to update
     *   }
     * })
     */
    upsert<T extends OtpUpsertArgs>(args: SelectSubset<T, OtpUpsertArgs<ExtArgs>>): Prisma__OtpClient<$Result.GetResult<Prisma.$OtpPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;

    /**
     * Count the number of Otps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpCountArgs} args - Arguments to filter Otps to count.
     * @example
     * // Count the number of Otps
     * const count = await prisma.otp.count({
     *   where: {
     *     // ... the filter for the Otps we want to count
     *   }
     * })
    **/
    count<T extends OtpCountArgs>(args?: Subset<T, OtpCountArgs>): Prisma.PrismaPromise<T extends $Utils.Record<'select', any> ? T['select'] extends true ? number : GetScalarType<T['select'], OtpCountAggregateOutputType> : number>;

    /**
     * Allows you to perform aggregations operations on a Otp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OtpAggregateArgs>(args: Subset<T, OtpAggregateArgs>): Prisma.PrismaPromise<GetOtpAggregateType<T>>;

    /**
     * Group by Otp.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OtpGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<T extends OtpGroupByArgs, HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>, OrderByArg extends (True extends HasSelectOrTake ? {
      orderBy: OtpGroupByArgs['orderBy'];
    } : {
      orderBy?: OtpGroupByArgs['orderBy'];
    }), OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>, ByFields extends MaybeTupleToUnion<T['by']>, ByValid extends Has<ByFields, OrderFields>, HavingFields extends GetHavingFields<T['having']>, HavingValid extends Has<ByFields, HavingFields>, ByEmpty extends (T['by'] extends never[] ? True : False), InputErrors extends (ByEmpty extends True ? `Error: "by" must not be empty.` : HavingValid extends False ? { [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`] }[HavingFields] : 'take' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Keys<T> ? 'orderBy' extends Keys<T> ? ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends True ? {} : { [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"` }[OrderFields])>(args: SubsetIntersection<T, OtpGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOtpGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Otp model
     */
    readonly fields: OtpFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Otp.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OtpClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    auth<T extends AuthDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AuthDefaultArgs<ExtArgs>>): Prisma__AuthClient<$Result.GetResult<Prisma.$AuthPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Otp model
   */
  interface OtpFieldRefs {
    readonly id: FieldRef<"Otp", 'String'>;
    readonly code: FieldRef<"Otp", 'String'>;
    readonly purpose: FieldRef<"Otp", 'OtpPurpose'>;
    readonly expiresAt: FieldRef<"Otp", 'DateTime'>;
    readonly isUsed: FieldRef<"Otp", 'Boolean'>;
    readonly createdAt: FieldRef<"Otp", 'DateTime'>;
    readonly updatedAt: FieldRef<"Otp", 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Otp findUnique
   */
  export type OtpFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpInclude<ExtArgs> | null;
    /**
     * Filter, which Otp to fetch.
     */
    where: OtpWhereUniqueInput;
  };

  /**
   * Otp findUniqueOrThrow
   */
  export type OtpFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpInclude<ExtArgs> | null;
    /**
     * Filter, which Otp to fetch.
     */
    where: OtpWhereUniqueInput;
  };

  /**
   * Otp findFirst
   */
  export type OtpFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpInclude<ExtArgs> | null;
    /**
     * Filter, which Otp to fetch.
     */
    where?: OtpWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Otps to fetch.
     */
    orderBy?: OtpOrderByWithRelationInput | OtpOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Otps.
     */
    cursor?: OtpWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Otps from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Otps.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Otps.
     */
    distinct?: OtpScalarFieldEnum | OtpScalarFieldEnum[];
  };

  /**
   * Otp findFirstOrThrow
   */
  export type OtpFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpInclude<ExtArgs> | null;
    /**
     * Filter, which Otp to fetch.
     */
    where?: OtpWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Otps to fetch.
     */
    orderBy?: OtpOrderByWithRelationInput | OtpOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Otps.
     */
    cursor?: OtpWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Otps from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Otps.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Otps.
     */
    distinct?: OtpScalarFieldEnum | OtpScalarFieldEnum[];
  };

  /**
   * Otp findMany
   */
  export type OtpFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpInclude<ExtArgs> | null;
    /**
     * Filter, which Otps to fetch.
     */
    where?: OtpWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Otps to fetch.
     */
    orderBy?: OtpOrderByWithRelationInput | OtpOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Otps.
     */
    cursor?: OtpWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Otps from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Otps.
     */
    skip?: number;
    distinct?: OtpScalarFieldEnum | OtpScalarFieldEnum[];
  };

  /**
   * Otp create
   */
  export type OtpCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpInclude<ExtArgs> | null;
    /**
     * The data needed to create a Otp.
     */
    data: XOR<OtpCreateInput, OtpUncheckedCreateInput>;
  };

  /**
   * Otp createMany
   */
  export type OtpCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Otps.
     */
    data: OtpCreateManyInput | OtpCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Otp createManyAndReturn
   */
  export type OtpCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * The data used to create many Otps.
     */
    data: OtpCreateManyInput | OtpCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Otp update
   */
  export type OtpUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpInclude<ExtArgs> | null;
    /**
     * The data needed to update a Otp.
     */
    data: XOR<OtpUpdateInput, OtpUncheckedUpdateInput>;
    /**
     * Choose, which Otp to update.
     */
    where: OtpWhereUniqueInput;
  };

  /**
   * Otp updateMany
   */
  export type OtpUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Otps.
     */
    data: XOR<OtpUpdateManyMutationInput, OtpUncheckedUpdateManyInput>;
    /**
     * Filter which Otps to update
     */
    where?: OtpWhereInput;
    /**
     * Limit how many Otps to update.
     */
    limit?: number;
  };

  /**
   * Otp updateManyAndReturn
   */
  export type OtpUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * The data used to update Otps.
     */
    data: XOR<OtpUpdateManyMutationInput, OtpUncheckedUpdateManyInput>;
    /**
     * Filter which Otps to update
     */
    where?: OtpWhereInput;
    /**
     * Limit how many Otps to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Otp upsert
   */
  export type OtpUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpInclude<ExtArgs> | null;
    /**
     * The filter to search for the Otp to update in case it exists.
     */
    where: OtpWhereUniqueInput;
    /**
     * In case the Otp found by the `where` argument doesn't exist, create a new Otp with this data.
     */
    create: XOR<OtpCreateInput, OtpUncheckedCreateInput>;
    /**
     * In case the Otp was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OtpUpdateInput, OtpUncheckedUpdateInput>;
  };

  /**
   * Otp delete
   */
  export type OtpDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpInclude<ExtArgs> | null;
    /**
     * Filter which Otp to delete.
     */
    where: OtpWhereUniqueInput;
  };

  /**
   * Otp deleteMany
   */
  export type OtpDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Otps to delete
     */
    where?: OtpWhereInput;
    /**
     * Limit how many Otps to delete.
     */
    limit?: number;
  };

  /**
   * Otp without action
   */
  export type OtpDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Otp
     */
    select?: OtpSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Otp
     */
    omit?: OtpOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OtpInclude<ExtArgs> | null;
  };

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
  export const AuthScalarFieldEnum: {
    id: 'id';
    phoneNumber: 'phoneNumber';
    email: 'email';
    passwordHash: 'passwordHash';
    role: 'role';
    lastLogin: 'lastLogin';
    refreshTokens: 'refreshTokens';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
    otpId: 'otpId';
  };
  export type AuthScalarFieldEnum = (typeof AuthScalarFieldEnum)[keyof typeof AuthScalarFieldEnum];
  export const OtpScalarFieldEnum: {
    id: 'id';
    code: 'code';
    purpose: 'purpose';
    expiresAt: 'expiresAt';
    isUsed: 'isUsed';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };
  export type OtpScalarFieldEnum = (typeof OtpScalarFieldEnum)[keyof typeof OtpScalarFieldEnum];
  export const SortOrder: {
    asc: 'asc';
    desc: 'desc';
  };
  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
  export const QueryMode: {
    default: 'default';
    insensitive: 'insensitive';
  };
  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
  export const NullsOrder: {
    first: 'first';
    last: 'last';
  };
  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;

  /**
   * Reference to a field of type 'OtpPurpose'
   */
  export type EnumOtpPurposeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OtpPurpose'>;

  /**
   * Reference to a field of type 'OtpPurpose[]'
   */
  export type ListEnumOtpPurposeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OtpPurpose[]'>;

  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;

  /**
   * Deep Input Types
   */

  export type AuthWhereInput = {
    AND?: AuthWhereInput | AuthWhereInput[];
    OR?: AuthWhereInput[];
    NOT?: AuthWhereInput | AuthWhereInput[];
    id?: StringFilter<"Auth"> | string;
    phoneNumber?: StringNullableFilter<"Auth"> | string | null;
    email?: StringNullableFilter<"Auth"> | string | null;
    passwordHash?: StringFilter<"Auth"> | string;
    role?: StringFilter<"Auth"> | string;
    lastLogin?: DateTimeFilter<"Auth"> | Date | string;
    refreshTokens?: StringNullableListFilter<"Auth">;
    createdAt?: DateTimeFilter<"Auth"> | Date | string;
    updatedAt?: DateTimeFilter<"Auth"> | Date | string;
    otpId?: StringFilter<"Auth"> | string;
    otp?: XOR<OtpNullableScalarRelationFilter, OtpWhereInput> | null;
  };
  export type AuthOrderByWithRelationInput = {
    id?: SortOrder;
    phoneNumber?: SortOrderInput | SortOrder;
    email?: SortOrderInput | SortOrder;
    passwordHash?: SortOrder;
    role?: SortOrder;
    lastLogin?: SortOrder;
    refreshTokens?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    otpId?: SortOrder;
    otp?: OtpOrderByWithRelationInput;
  };
  export type AuthWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    phoneNumber?: string;
    email?: string;
    AND?: AuthWhereInput | AuthWhereInput[];
    OR?: AuthWhereInput[];
    NOT?: AuthWhereInput | AuthWhereInput[];
    passwordHash?: StringFilter<"Auth"> | string;
    role?: StringFilter<"Auth"> | string;
    lastLogin?: DateTimeFilter<"Auth"> | Date | string;
    refreshTokens?: StringNullableListFilter<"Auth">;
    createdAt?: DateTimeFilter<"Auth"> | Date | string;
    updatedAt?: DateTimeFilter<"Auth"> | Date | string;
    otpId?: StringFilter<"Auth"> | string;
    otp?: XOR<OtpNullableScalarRelationFilter, OtpWhereInput> | null;
  }, "id" | "phoneNumber" | "email">;
  export type AuthOrderByWithAggregationInput = {
    id?: SortOrder;
    phoneNumber?: SortOrderInput | SortOrder;
    email?: SortOrderInput | SortOrder;
    passwordHash?: SortOrder;
    role?: SortOrder;
    lastLogin?: SortOrder;
    refreshTokens?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    otpId?: SortOrder;
    _count?: AuthCountOrderByAggregateInput;
    _max?: AuthMaxOrderByAggregateInput;
    _min?: AuthMinOrderByAggregateInput;
  };
  export type AuthScalarWhereWithAggregatesInput = {
    AND?: AuthScalarWhereWithAggregatesInput | AuthScalarWhereWithAggregatesInput[];
    OR?: AuthScalarWhereWithAggregatesInput[];
    NOT?: AuthScalarWhereWithAggregatesInput | AuthScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"Auth"> | string;
    phoneNumber?: StringNullableWithAggregatesFilter<"Auth"> | string | null;
    email?: StringNullableWithAggregatesFilter<"Auth"> | string | null;
    passwordHash?: StringWithAggregatesFilter<"Auth"> | string;
    role?: StringWithAggregatesFilter<"Auth"> | string;
    lastLogin?: DateTimeWithAggregatesFilter<"Auth"> | Date | string;
    refreshTokens?: StringNullableListFilter<"Auth">;
    createdAt?: DateTimeWithAggregatesFilter<"Auth"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"Auth"> | Date | string;
    otpId?: StringWithAggregatesFilter<"Auth"> | string;
  };
  export type OtpWhereInput = {
    AND?: OtpWhereInput | OtpWhereInput[];
    OR?: OtpWhereInput[];
    NOT?: OtpWhereInput | OtpWhereInput[];
    id?: StringFilter<"Otp"> | string;
    code?: StringFilter<"Otp"> | string;
    purpose?: EnumOtpPurposeFilter<"Otp"> | $Enums.OtpPurpose;
    expiresAt?: DateTimeFilter<"Otp"> | Date | string;
    isUsed?: BoolFilter<"Otp"> | boolean;
    createdAt?: DateTimeFilter<"Otp"> | Date | string;
    updatedAt?: DateTimeFilter<"Otp"> | Date | string;
    auth?: XOR<AuthScalarRelationFilter, AuthWhereInput>;
  };
  export type OtpOrderByWithRelationInput = {
    id?: SortOrder;
    code?: SortOrder;
    purpose?: SortOrder;
    expiresAt?: SortOrder;
    isUsed?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    auth?: AuthOrderByWithRelationInput;
  };
  export type OtpWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: OtpWhereInput | OtpWhereInput[];
    OR?: OtpWhereInput[];
    NOT?: OtpWhereInput | OtpWhereInput[];
    code?: StringFilter<"Otp"> | string;
    purpose?: EnumOtpPurposeFilter<"Otp"> | $Enums.OtpPurpose;
    expiresAt?: DateTimeFilter<"Otp"> | Date | string;
    isUsed?: BoolFilter<"Otp"> | boolean;
    createdAt?: DateTimeFilter<"Otp"> | Date | string;
    updatedAt?: DateTimeFilter<"Otp"> | Date | string;
    auth?: XOR<AuthScalarRelationFilter, AuthWhereInput>;
  }, "id">;
  export type OtpOrderByWithAggregationInput = {
    id?: SortOrder;
    code?: SortOrder;
    purpose?: SortOrder;
    expiresAt?: SortOrder;
    isUsed?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: OtpCountOrderByAggregateInput;
    _max?: OtpMaxOrderByAggregateInput;
    _min?: OtpMinOrderByAggregateInput;
  };
  export type OtpScalarWhereWithAggregatesInput = {
    AND?: OtpScalarWhereWithAggregatesInput | OtpScalarWhereWithAggregatesInput[];
    OR?: OtpScalarWhereWithAggregatesInput[];
    NOT?: OtpScalarWhereWithAggregatesInput | OtpScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<"Otp"> | string;
    code?: StringWithAggregatesFilter<"Otp"> | string;
    purpose?: EnumOtpPurposeWithAggregatesFilter<"Otp"> | $Enums.OtpPurpose;
    expiresAt?: DateTimeWithAggregatesFilter<"Otp"> | Date | string;
    isUsed?: BoolWithAggregatesFilter<"Otp"> | boolean;
    createdAt?: DateTimeWithAggregatesFilter<"Otp"> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<"Otp"> | Date | string;
  };
  export type AuthCreateInput = {
    id?: string;
    phoneNumber?: string | null;
    email?: string | null;
    passwordHash: string;
    role: string;
    lastLogin: Date | string;
    refreshTokens?: AuthCreaterefreshTokensInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    otpId: string;
    otp?: OtpCreateNestedOneWithoutAuthInput;
  };
  export type AuthUncheckedCreateInput = {
    id?: string;
    phoneNumber?: string | null;
    email?: string | null;
    passwordHash: string;
    role: string;
    lastLogin: Date | string;
    refreshTokens?: AuthCreaterefreshTokensInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    otpId: string;
    otp?: OtpUncheckedCreateNestedOneWithoutAuthInput;
  };
  export type AuthUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: NullableStringFieldUpdateOperationsInput | string | null;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: StringFieldUpdateOperationsInput | string;
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string;
    refreshTokens?: AuthUpdaterefreshTokensInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    otpId?: StringFieldUpdateOperationsInput | string;
    otp?: OtpUpdateOneWithoutAuthNestedInput;
  };
  export type AuthUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: NullableStringFieldUpdateOperationsInput | string | null;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: StringFieldUpdateOperationsInput | string;
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string;
    refreshTokens?: AuthUpdaterefreshTokensInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    otpId?: StringFieldUpdateOperationsInput | string;
    otp?: OtpUncheckedUpdateOneWithoutAuthNestedInput;
  };
  export type AuthCreateManyInput = {
    id?: string;
    phoneNumber?: string | null;
    email?: string | null;
    passwordHash: string;
    role: string;
    lastLogin: Date | string;
    refreshTokens?: AuthCreaterefreshTokensInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    otpId: string;
  };
  export type AuthUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: NullableStringFieldUpdateOperationsInput | string | null;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: StringFieldUpdateOperationsInput | string;
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string;
    refreshTokens?: AuthUpdaterefreshTokensInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    otpId?: StringFieldUpdateOperationsInput | string;
  };
  export type AuthUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: NullableStringFieldUpdateOperationsInput | string | null;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: StringFieldUpdateOperationsInput | string;
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string;
    refreshTokens?: AuthUpdaterefreshTokensInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    otpId?: StringFieldUpdateOperationsInput | string;
  };
  export type OtpCreateInput = {
    code: string;
    purpose: $Enums.OtpPurpose;
    expiresAt: Date | string;
    isUsed: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    auth?: AuthCreateNestedOneWithoutOtpInput;
  };
  export type OtpUncheckedCreateInput = {
    id?: string;
    code: string;
    purpose: $Enums.OtpPurpose;
    expiresAt: Date | string;
    isUsed: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  export type OtpUpdateInput = {
    code?: StringFieldUpdateOperationsInput | string;
    purpose?: EnumOtpPurposeFieldUpdateOperationsInput | $Enums.OtpPurpose;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    isUsed?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    auth?: AuthUpdateOneRequiredWithoutOtpNestedInput;
  };
  export type OtpUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    code?: StringFieldUpdateOperationsInput | string;
    purpose?: EnumOtpPurposeFieldUpdateOperationsInput | $Enums.OtpPurpose;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    isUsed?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };
  export type OtpCreateManyInput = {
    id?: string;
    code: string;
    purpose: $Enums.OtpPurpose;
    expiresAt: Date | string;
    isUsed: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  export type OtpUpdateManyMutationInput = {
    code?: StringFieldUpdateOperationsInput | string;
    purpose?: EnumOtpPurposeFieldUpdateOperationsInput | $Enums.OtpPurpose;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    isUsed?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };
  export type OtpUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    code?: StringFieldUpdateOperationsInput | string;
    purpose?: EnumOtpPurposeFieldUpdateOperationsInput | $Enums.OtpPurpose;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    isUsed?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };
  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };
  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };
  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };
  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
  };
  export type OtpNullableScalarRelationFilter = {
    is?: OtpWhereInput | null;
    isNot?: OtpWhereInput | null;
  };
  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };
  export type AuthCountOrderByAggregateInput = {
    id?: SortOrder;
    phoneNumber?: SortOrder;
    email?: SortOrder;
    passwordHash?: SortOrder;
    role?: SortOrder;
    lastLogin?: SortOrder;
    refreshTokens?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    otpId?: SortOrder;
  };
  export type AuthMaxOrderByAggregateInput = {
    id?: SortOrder;
    phoneNumber?: SortOrder;
    email?: SortOrder;
    passwordHash?: SortOrder;
    role?: SortOrder;
    lastLogin?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    otpId?: SortOrder;
  };
  export type AuthMinOrderByAggregateInput = {
    id?: SortOrder;
    phoneNumber?: SortOrder;
    email?: SortOrder;
    passwordHash?: SortOrder;
    role?: SortOrder;
    lastLogin?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    otpId?: SortOrder;
  };
  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };
  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };
  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };
  export type EnumOtpPurposeFilter<$PrismaModel = never> = {
    equals?: $Enums.OtpPurpose | EnumOtpPurposeFieldRefInput<$PrismaModel>;
    in?: $Enums.OtpPurpose[] | ListEnumOtpPurposeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OtpPurpose[] | ListEnumOtpPurposeFieldRefInput<$PrismaModel>;
    not?: NestedEnumOtpPurposeFilter<$PrismaModel> | $Enums.OtpPurpose;
  };
  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };
  export type AuthScalarRelationFilter = {
    is?: AuthWhereInput;
    isNot?: AuthWhereInput;
  };
  export type OtpCountOrderByAggregateInput = {
    id?: SortOrder;
    code?: SortOrder;
    purpose?: SortOrder;
    expiresAt?: SortOrder;
    isUsed?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };
  export type OtpMaxOrderByAggregateInput = {
    id?: SortOrder;
    code?: SortOrder;
    purpose?: SortOrder;
    expiresAt?: SortOrder;
    isUsed?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };
  export type OtpMinOrderByAggregateInput = {
    id?: SortOrder;
    code?: SortOrder;
    purpose?: SortOrder;
    expiresAt?: SortOrder;
    isUsed?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };
  export type EnumOtpPurposeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OtpPurpose | EnumOtpPurposeFieldRefInput<$PrismaModel>;
    in?: $Enums.OtpPurpose[] | ListEnumOtpPurposeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OtpPurpose[] | ListEnumOtpPurposeFieldRefInput<$PrismaModel>;
    not?: NestedEnumOtpPurposeWithAggregatesFilter<$PrismaModel> | $Enums.OtpPurpose;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumOtpPurposeFilter<$PrismaModel>;
    _max?: NestedEnumOtpPurposeFilter<$PrismaModel>;
  };
  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };
  export type AuthCreaterefreshTokensInput = {
    set: string[];
  };
  export type OtpCreateNestedOneWithoutAuthInput = {
    create?: XOR<OtpCreateWithoutAuthInput, OtpUncheckedCreateWithoutAuthInput>;
    connectOrCreate?: OtpCreateOrConnectWithoutAuthInput;
    connect?: OtpWhereUniqueInput;
  };
  export type OtpUncheckedCreateNestedOneWithoutAuthInput = {
    create?: XOR<OtpCreateWithoutAuthInput, OtpUncheckedCreateWithoutAuthInput>;
    connectOrCreate?: OtpCreateOrConnectWithoutAuthInput;
    connect?: OtpWhereUniqueInput;
  };
  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };
  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };
  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };
  export type AuthUpdaterefreshTokensInput = {
    set?: string[];
    push?: string | string[];
  };
  export type OtpUpdateOneWithoutAuthNestedInput = {
    create?: XOR<OtpCreateWithoutAuthInput, OtpUncheckedCreateWithoutAuthInput>;
    connectOrCreate?: OtpCreateOrConnectWithoutAuthInput;
    upsert?: OtpUpsertWithoutAuthInput;
    disconnect?: OtpWhereInput | boolean;
    delete?: OtpWhereInput | boolean;
    connect?: OtpWhereUniqueInput;
    update?: XOR<XOR<OtpUpdateToOneWithWhereWithoutAuthInput, OtpUpdateWithoutAuthInput>, OtpUncheckedUpdateWithoutAuthInput>;
  };
  export type OtpUncheckedUpdateOneWithoutAuthNestedInput = {
    create?: XOR<OtpCreateWithoutAuthInput, OtpUncheckedCreateWithoutAuthInput>;
    connectOrCreate?: OtpCreateOrConnectWithoutAuthInput;
    upsert?: OtpUpsertWithoutAuthInput;
    disconnect?: OtpWhereInput | boolean;
    delete?: OtpWhereInput | boolean;
    connect?: OtpWhereUniqueInput;
    update?: XOR<XOR<OtpUpdateToOneWithWhereWithoutAuthInput, OtpUpdateWithoutAuthInput>, OtpUncheckedUpdateWithoutAuthInput>;
  };
  export type AuthCreateNestedOneWithoutOtpInput = {
    create?: XOR<AuthCreateWithoutOtpInput, AuthUncheckedCreateWithoutOtpInput>;
    connectOrCreate?: AuthCreateOrConnectWithoutOtpInput;
    connect?: AuthWhereUniqueInput;
  };
  export type EnumOtpPurposeFieldUpdateOperationsInput = {
    set?: $Enums.OtpPurpose;
  };
  export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
  };
  export type AuthUpdateOneRequiredWithoutOtpNestedInput = {
    create?: XOR<AuthCreateWithoutOtpInput, AuthUncheckedCreateWithoutOtpInput>;
    connectOrCreate?: AuthCreateOrConnectWithoutOtpInput;
    upsert?: AuthUpsertWithoutOtpInput;
    connect?: AuthWhereUniqueInput;
    update?: XOR<XOR<AuthUpdateToOneWithWhereWithoutOtpInput, AuthUpdateWithoutOtpInput>, AuthUncheckedUpdateWithoutOtpInput>;
  };
  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };
  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };
  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };
  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };
  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };
  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };
  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };
  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };
  export type NestedEnumOtpPurposeFilter<$PrismaModel = never> = {
    equals?: $Enums.OtpPurpose | EnumOtpPurposeFieldRefInput<$PrismaModel>;
    in?: $Enums.OtpPurpose[] | ListEnumOtpPurposeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OtpPurpose[] | ListEnumOtpPurposeFieldRefInput<$PrismaModel>;
    not?: NestedEnumOtpPurposeFilter<$PrismaModel> | $Enums.OtpPurpose;
  };
  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolFilter<$PrismaModel> | boolean;
  };
  export type NestedEnumOtpPurposeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OtpPurpose | EnumOtpPurposeFieldRefInput<$PrismaModel>;
    in?: $Enums.OtpPurpose[] | ListEnumOtpPurposeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.OtpPurpose[] | ListEnumOtpPurposeFieldRefInput<$PrismaModel>;
    not?: NestedEnumOtpPurposeWithAggregatesFilter<$PrismaModel> | $Enums.OtpPurpose;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumOtpPurposeFilter<$PrismaModel>;
    _max?: NestedEnumOtpPurposeFilter<$PrismaModel>;
  };
  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>;
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedBoolFilter<$PrismaModel>;
    _max?: NestedBoolFilter<$PrismaModel>;
  };
  export type OtpCreateWithoutAuthInput = {
    code: string;
    purpose: $Enums.OtpPurpose;
    expiresAt: Date | string;
    isUsed: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  export type OtpUncheckedCreateWithoutAuthInput = {
    code: string;
    purpose: $Enums.OtpPurpose;
    expiresAt: Date | string;
    isUsed: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };
  export type OtpCreateOrConnectWithoutAuthInput = {
    where: OtpWhereUniqueInput;
    create: XOR<OtpCreateWithoutAuthInput, OtpUncheckedCreateWithoutAuthInput>;
  };
  export type OtpUpsertWithoutAuthInput = {
    update: XOR<OtpUpdateWithoutAuthInput, OtpUncheckedUpdateWithoutAuthInput>;
    create: XOR<OtpCreateWithoutAuthInput, OtpUncheckedCreateWithoutAuthInput>;
    where?: OtpWhereInput;
  };
  export type OtpUpdateToOneWithWhereWithoutAuthInput = {
    where?: OtpWhereInput;
    data: XOR<OtpUpdateWithoutAuthInput, OtpUncheckedUpdateWithoutAuthInput>;
  };
  export type OtpUpdateWithoutAuthInput = {
    code?: StringFieldUpdateOperationsInput | string;
    purpose?: EnumOtpPurposeFieldUpdateOperationsInput | $Enums.OtpPurpose;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    isUsed?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };
  export type OtpUncheckedUpdateWithoutAuthInput = {
    code?: StringFieldUpdateOperationsInput | string;
    purpose?: EnumOtpPurposeFieldUpdateOperationsInput | $Enums.OtpPurpose;
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    isUsed?: BoolFieldUpdateOperationsInput | boolean;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };
  export type AuthCreateWithoutOtpInput = {
    id?: string;
    phoneNumber?: string | null;
    email?: string | null;
    passwordHash: string;
    role: string;
    lastLogin: Date | string;
    refreshTokens?: AuthCreaterefreshTokensInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    otpId: string;
  };
  export type AuthUncheckedCreateWithoutOtpInput = {
    id?: string;
    phoneNumber?: string | null;
    email?: string | null;
    passwordHash: string;
    role: string;
    lastLogin: Date | string;
    refreshTokens?: AuthCreaterefreshTokensInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    otpId: string;
  };
  export type AuthCreateOrConnectWithoutOtpInput = {
    where: AuthWhereUniqueInput;
    create: XOR<AuthCreateWithoutOtpInput, AuthUncheckedCreateWithoutOtpInput>;
  };
  export type AuthUpsertWithoutOtpInput = {
    update: XOR<AuthUpdateWithoutOtpInput, AuthUncheckedUpdateWithoutOtpInput>;
    create: XOR<AuthCreateWithoutOtpInput, AuthUncheckedCreateWithoutOtpInput>;
    where?: AuthWhereInput;
  };
  export type AuthUpdateToOneWithWhereWithoutOtpInput = {
    where?: AuthWhereInput;
    data: XOR<AuthUpdateWithoutOtpInput, AuthUncheckedUpdateWithoutOtpInput>;
  };
  export type AuthUpdateWithoutOtpInput = {
    id?: StringFieldUpdateOperationsInput | string;
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: NullableStringFieldUpdateOperationsInput | string | null;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: StringFieldUpdateOperationsInput | string;
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string;
    refreshTokens?: AuthUpdaterefreshTokensInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    otpId?: StringFieldUpdateOperationsInput | string;
  };
  export type AuthUncheckedUpdateWithoutOtpInput = {
    id?: StringFieldUpdateOperationsInput | string;
    phoneNumber?: NullableStringFieldUpdateOperationsInput | string | null;
    email?: NullableStringFieldUpdateOperationsInput | string | null;
    passwordHash?: StringFieldUpdateOperationsInput | string;
    role?: StringFieldUpdateOperationsInput | string;
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string;
    refreshTokens?: AuthUpdaterefreshTokensInput | string[];
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    otpId?: StringFieldUpdateOperationsInput | string;
  };

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
  createOTP<T = OtpType>({
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