import { ZodType, ZodTypeAny } from "zod";
import { HttpResponse } from "./response";
import { ContentType, contentTypes } from "../types";
import { HttpError, HttpStatus, HttpSuccessStatus } from "../errors";
import { Method, SchemaContract, ZodShape } from "../contract";

export function validate<T>(
  input: ZodShape,
  data: T,
  requestId: string
) {
  for (const key in data) {
    const schema = input[key];
    const result = schema.safeParse(data[key]);
    if (!result.success) {
      throw new HttpError(
        500,
        "ERR_RESPONSE_VALIDATION",
        `Validation failed for request ${requestId} with error: ${result.error.issues}`
      );
    }
  }
}

export function getSchemaAndType(def: unknown): {
  schema?: ZodTypeAny;
  type: ContentType;
} {
  if (!def) return { type: "json" };

  if (
    typeof def === "object" &&
    def !== null &&
    "schema" in def &&
    "type" in def
  ) {
    return {
      schema: (def as any).schema,
      type: (def as any).type,
    };
  }

  if (def instanceof ZodType) {
    return { schema: def, type: "json" };
  }

  return { type: "json" };
}

export function validateAndRespond(
  res: HttpResponse<any>,
  status: HttpStatus,
  schema: ZodTypeAny | undefined,
  data: unknown,
  validate = true
) {
  if (validate && schema) {
    const result = schema.safeParse(data);
    if (!result.success) {
      // logError(`[Server] Response validation failed`, result.error.issues);
      res.status(500).json({
        code: "ERR_INTERNAL_SERVER_ERROR",
        message: "Response validation failed.",
      });
      return;
    }
    data = result.data;
  }

  const mimeType = contentTypes["json"];
  res.status(status).buildResponse({ type: mimeType, schema }, data, validate);
}


export function resolveResponse<
  C extends SchemaContract<Method, any, any, any, any, any>
>(contract: C, res: HttpResponse<any>, data: unknown, validate = false) {
  if (data instanceof HttpError) {
    const { status, code, message } = data;
    const errorDef = contract.responses[status];
    const { schema } = getSchemaAndType(errorDef);

    if (!errorDef || !schema) {

      res.status(status).json({ code, message });
      return;
    }

    validateAndRespond(res, status, schema, { code, message }, validate);
    return;
  }

  for (const [codeStr, def] of Object.entries(contract.responses)) {
    const code = Number(codeStr) as HttpSuccessStatus;
    if (code >= 400) continue;

    const { schema } = getSchemaAndType(def);
    if (!schema) continue;

    const result = schema.safeParse(data);
    if (result.success) {
      validateAndRespond(res, code, schema, result.data, validate);
      return;
    }
  }

  // logError(`Handler for ${contract.path} returned unknown shape`, data);

  const fallback = new HttpError(500, "ERR_FROM_LINECHECK_API");
  const def = contract.responses[500];
  const { schema } = getSchemaAndType(def);

  validateAndRespond(
    res,
    500,
    schema,
    { code: fallback.code, message: fallback.message },
    validate
  );
}
