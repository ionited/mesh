import { ZodLiteral, ZodObject, ZodTypeAny } from "zod";

export const HTTP_SUCCESS_CODES = {
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  EARLY_HINTS: 103,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  MOVED_TEMPORARILY: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
} as const;

export const HTTP_ERROR_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  REQUEST_TOO_LONG: 413,
  REQUEST_URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  REQUESTED_RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  INSUFFICIENT_SPACE_ON_RESOURCE: 419,
  METHOD_FAILURE: 420,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  INSUFFICIENT_STORAGE: 507,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;

export const HTTP_SERVICE_CODES = {
  ERR_INVALID_SESSION_ID: 400,
  ERR_INVALID_ID_TYPE_ID: 400,
  ERR_INTERNAL_SERVER_ERROR: 500,
  ERR_INVALID_OFFER_ID: 400,
  ERR_INVALID_CONTENT_TYPE: 400,
  ERR_RESPONSE_VALIDATION: 500,
  ERR_REF_ID_NOT_FOUND: 404,
  ERR_FROM_LINECHECK_API: 500,
  ERR_FROM_PDF_API: 500,
  ERR_VALIDATION_QUERY: 402,
  ERR_VALIDATION_PARAMS: 402,
  ERR_VALIDATION_HEADERS: 402,
  ERR_VALIDATION_BODY: 402,
} as const;

export const HTTP_SERVICE_ERROR_CODES = {
  ...HTTP_ERROR_CODES,
  ...HTTP_SERVICE_CODES,
} as const;

export const HTTP_ALL_CODES = {
  ...HTTP_SUCCESS_CODES,
  ...HTTP_SERVICE_ERROR_CODES,
} as const;

export type HttpSuccessCode = keyof typeof HTTP_SUCCESS_CODES;

export type HttpErrorCode = keyof typeof HTTP_SERVICE_ERROR_CODES;

export type HttpErrorStatus = (typeof HTTP_SERVICE_ERROR_CODES)[HttpErrorCode];

export type HttpSuccessStatus = (typeof HTTP_SUCCESS_CODES)[HttpSuccessCode];

export type HttpStatus = HttpSuccessStatus | HttpErrorStatus;

export type ErrorStatusCode = {
  [S in (typeof HTTP_SERVICE_ERROR_CODES)[HttpErrorCode]]: {
    [K in keyof typeof HTTP_SERVICE_ERROR_CODES]: (typeof HTTP_SERVICE_ERROR_CODES)[K] extends S
      ? K
      : never;
  }[keyof typeof HTTP_SERVICE_ERROR_CODES];
};
export function isSuccessStatus(code: number): code is HttpSuccessStatus {
  return code >= 100 && code < 400;
}

export function isErrorStatus(code: number): code is HttpErrorStatus {
  return code >= 400 && code < 600;
}

export function validateErrorSchema(code: string, schema: ZodTypeAny) {
  if (!Object.prototype.hasOwnProperty.call(HTTP_SERVICE_ERROR_CODES, code)) {
    throw new Error(
      `Invalid error code "${code}". Must be one of ERROR_STATUS_CODE keys.`
    );
  }

  if (!(schema instanceof ZodObject)) {
    throw new Error(`Error schema for "${code}" must be a z.object`);
  }

  const literal = schema.shape?.code;

  if (!(literal instanceof ZodLiteral) || literal.value !== code) {
    throw new Error(
      `Error response for "${code}" must be z.object({ code: z.literal("${code}") })`
    );
  }
}

export class HttpError<S extends HttpErrorStatus = HttpErrorStatus> extends Error {
  constructor(
    public status: S,
    public code: ErrorStatusCode[S],
    public text?: string
  ) {
    super(`HttpError: ${code}`);
    this.message = text || "";
  }
}
