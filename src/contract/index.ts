import {
  z,
  ZodTypeAny,
  ZodObject,
  ZodLiteral,
  ZodType,
  object,
  literal,
  ZodString,
} from "zod";
import {
  HttpErrorCode,
  HttpErrorStatus,
  isSuccessStatus,
  HttpSuccessStatus,
  validateErrorSchema,
  HTTP_SERVICE_ERROR_CODES as HTTP_ERROR_SERVICE_CODES,
} from "../errors";

import {  IncomingHeaders } from "../standard/request.header";
import { ContentType } from "../types";

export { ContentType };

export const methods = ["del", "get", "options", "post", "put"] as const;

export type Method = (typeof methods)[number];

type MethodsWithBody = "post" | "put" | "patch";

type ZodHeaderValue = z.ZodString | z.ZodArray<z.ZodString> | z.ZodOptional<z.ZodString> | z.ZodOptional<z.ZodArray<z.ZodString>>;

export type InputSchemas<P extends string, M extends Method> = {
  query?: ZodShape;
  headers?: Partial<Record<keyof IncomingHeaders, ZodHeaderValue>>;
} & ExtendWithParams<P> &
  ExtendWithBody<M>;

type ExtendWithParams<P extends string> = [ExtractRouteParams<P>] extends [
  never
]
  ? {}
  : { params: ExtractRouteParams<P> };

type ExtendWithBody<M extends Method> = M extends MethodsWithBody
  ? { body: ZodShape }
  : {};

type ExtendWithType<
  C extends ContentType,
  M extends Method
> = M extends MethodsWithBody ? { type: C } : {};

type HasRouteParam<P extends string> = P extends `${string}:${string}`
  ? true
  : false;

type Exact<T, ZodShape> = T extends ZodShape
  ? Exclude<keyof T, keyof ZodShape> extends never
    ? T
    : never
  : never;

export type ExtractRouteParams<P extends string> = string extends P
  ? Record<string, ZodString>
  : HasRouteParam<P> extends false
  ? never
  : P extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? Exact<
      { [K in Param | keyof ExtractRouteParams<Rest>]: ZodString },
      { [K in Param | keyof ExtractRouteParams<Rest>]: ZodString }
    >
  : P extends `${infer _Start}:${infer Param}`
  ? Exact<{ [K in Param]: ZodString }, { [K in Param]: ZodString }>
  : never;

export type SuccessResponse = Partial<
  Record<HttpSuccessStatus, Record<string, ZodTypeAny>>
>;

export type ErrorResponse = {
  code: HttpErrorCode[];
};

// Final typed response set
export type Responses<O, E extends ErrorResponse> =
  // Keep success responses as ZodObject directly
  {
    [K in keyof O]: ZodObject<O[K]>;
  } & {
    // Map each error status (like 400, 500) to a literal ZodObject with multiple error codes
    [S in HttpErrorStatus as S extends (typeof HTTP_ERROR_SERVICE_CODES)[E["code"][number]]
      ? S
      : never]: ZodObject<{
      code: ZodLiteral<
        Extract<
          E["code"][number],
          HttpErrorCode &
            {
              [K in HttpErrorCode]: (typeof HTTP_ERROR_SERVICE_CODES)[K] extends S
                ? K
                : never;
            }[HttpErrorCode]
        >
      >;
    }>;
  };

export type ZodShape = Record<string, ZodTypeAny>;

export interface ContractMetadata {
  tags?: string[];
  summary?: string;
  description?: string;
}

/** Core contract for one API operation (purely declarative) */
export type Contract<
  M extends Method,
  P extends string,
  I extends InputSchemas<P, M>,
  O extends SuccessResponse,
  E extends ErrorResponse,
  C extends ContentType = ContentType,
  D extends ContractMetadata = {}
> = {
  method: M;
  path: P;
  docs?: D;
  input?: I;
  output: O;
  errors?: E;
} & ExtendWithType<C, M>;

type ExtractSchema<I extends ZodShape | undefined> = I extends ZodShape
  ? ZodObject<I>
  : undefined;

export interface SchemaContract<
  M extends Method,
  P extends string,
  I extends InputSchemas<P, M>,
  O extends SuccessResponse,
  E extends ErrorResponse,
  D extends ContractMetadata = ContractMetadata
> {
  method: M;
  path: P;
  docs?: D;
  query: I extends { query: infer Q }
    ? Q extends ZodShape
      ? ExtractSchema<Q>
      : never
    : never;
  type: I extends { type: infer C }
    ? C extends ContentType
      ? C
      : never
    : never;
  headers: I extends { headers: infer H }
    ? H extends ZodShape
      ? ExtractSchema<H>
      : never
    : never;
  body: I extends { body: infer B }
    ? B extends ZodShape
      ? ExtractSchema<B>
      : never
    : never;
  params: I extends { params: infer P }
    ? P extends ZodShape
      ? ExtractSchema<P>
      : never
    : never;
  responses: Responses<O, E>;
}

function createZodObject<T extends ZodShape | undefined>(
  input?: T
): T extends ZodShape ? ZodObject<T> : undefined {
  return (input ? object(input) : undefined) as T extends ZodShape
    ? ZodObject<T>
    : undefined;
}

export function createContract<
  M extends Method,
  P extends string,
  I extends InputSchemas<P, M>,
  O extends SuccessResponse,
  E extends ErrorResponse
>(contract: Contract<M, P, I, O, E>): SchemaContract<M, P, I, O, E> {
  const input = {
    query:
      contract.input && "query" in contract.input
        ? createZodObject(contract.input.query)
        : undefined,
    body:
      contract.input && "body" in contract.input
        ? createZodObject(contract.input.body)
        : undefined,
    params:
      contract.input && "params" in contract.input
        ? createZodObject(contract.input.params)
        : undefined,
    headers:
      contract.input && "headers" in contract.input
        ? createZodObject(contract.input.headers as ZodShape)
        : undefined,
  };

  const type = "type" in contract && contract.type ? contract.type : undefined;

  const responses = {} as Responses<O, E>;

  if (contract.output) {
    for (const value in contract.output) {
      if (isSuccessStatus(Number(value))) {
        const status = value;
        const schema = createZodObject(contract.output[value]);
        (responses as any)[status]  = schema
      }
    }
  }

  // Add single error response
  if (contract.errors) {
    const codes = (
      typeof contract.errors.code === "string"
        ? [contract.errors.code]
        : contract.errors.code
    ) as HttpErrorCode[];

    for (const code of codes) {
      const status = HTTP_ERROR_SERVICE_CODES[code] ;
      const schema = object({ code: literal(code) });
      validateErrorSchema(code, schema);
      (responses as any)[status] = schema;
    }
  }

  return {
    method: contract.method,
    type: type,
    path: contract.path,
    docs: contract.docs,
    body: input.body,
    query: input.query,
    params: input.params,
    headers: input.headers,
    responses,
  } as SchemaContract<M, P, I, O, E>;
}

export type InferSchema<T> = T extends ZodType<any, any, any>
  ? z.infer<T>
  : never;

export type InferResponses<
  T extends SchemaContract<Method, any, any, any, any>
> = {
  [K in keyof T["responses"]]: InferSchema<T["responses"][K]>;
};

export type InferSuccessResponse<
  C extends SchemaContract<Method, any, any, any, any>
> = C["responses"][SuccessResponseKeys<C>] extends ZodType<any, any, any>
  ? z.infer<C["responses"][SuccessResponseKeys<C>]>
  : never;

type IsOptionalOrNever<T> = [T] extends [never]
  ? true
  : [undefined] extends [T]
  ? true
  : false;

type NonOptionalKeys<T> = {
  [K in keyof T as IsOptionalOrNever<T[K]> extends true ? never : K]: T[K];
};

export type InferContract<
  T extends SchemaContract<Method, any, any, any, any>
> = NonOptionalKeys<{
  method: T["method"];
  path: T["path"];
  docs: T["docs"];
  body: InferSchema<T["body"]>;
  query: InferSchema<T["query"]>;
  params: InferSchema<T["params"]>;
  responses: {
    [K in keyof T["responses"]]: T["responses"][K] extends ZodTypeAny
      ? z.infer<T["responses"][K]>
      : never;
  };
}>;

// Detect error response keys in contract
export type ErrorResponseKeys<
  C extends SchemaContract<Method, any, any, any, any>
> = {
  [K in keyof C["responses"] & number]: C["responses"][K] extends ZodType<
    any,
    any,
    any
  >
    ? z.infer<C["responses"][K]> extends { code: infer V }
      ? V extends HttpErrorCode
        ? K
        : never
      : never
    : never;
}[keyof C["responses"] & number];

// Success responses are everything else
export type SuccessResponseKeys<
  C extends SchemaContract<Method, any, any, any, any>
> = Exclude<keyof C["responses"] & number, ErrorResponseKeys<C>>;

// Union of all valid response types from the contract
export type OneOfResponses<
  C extends SchemaContract<Method, any, any, any, any>
> = C["responses"][keyof C["responses"]] extends ZodType<any, any, any>
  ? InferSchema<C["responses"][keyof C["responses"]]>
  : never;

export type EnsureErrorCode<
  C extends SchemaContract<Method, any, any, any, any>
> = C["responses"][keyof C["responses"]] extends ZodObject<infer Shape>
  ? Shape extends { code: ZodLiteral<infer L> }
    ? L extends HttpErrorCode
      ? L
      : never
    : never
  : never;
