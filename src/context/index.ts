import z, { ZodType } from "zod";
import {
  InferSchema,
  Method,
  OneOfResponses,
  SchemaContract,
} from "../contract/index";
import { HttpErrorCode } from "../errors";
import { HttpRequest, HttpResponse } from "../server/index";
import { Simplify } from "../types";

export type Context<
  C extends SchemaContract<Method, any, any, any, any, any>,
  D extends object = {}
> = Pick<
  HttpRequest<
    InferSchema<C["body"]>,
    InferSchema<C["query"]>,
    InferSchema<C["params"]>,
    InferSchema<C["headers"]>
  >,
  "body" | "files" | "params" | "query" | "headers" | "method"
> &
  Pick<
    HttpResponse<OneOfResponses<C>>,
    "header" | "text" | "file" | "status" | "end" | "json" | "binary" | "send"
  > & {
    data: Simplify<D>;
    error: (
      code: {
        [K in keyof C["responses"] &
          number]: C["responses"][K] extends ZodType<any>
          ? z.infer<C["responses"][K]> extends { code: infer Literal }
            ? Literal extends HttpErrorCode
              ? Literal
              : never
            : never
          : never;
      }[keyof C["responses"] & number]
    ) => never;
  };
