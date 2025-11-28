import z, { ZodObject } from "zod";
import {
  SchemaContract,
  InferSchema,
  ZodShape,
  Method,
} from "../contract/index";
import { HttpRequest } from "../server/index";
import { IncomingHeaders } from "../standard/request.header";

export type Middleware<
  Input extends MiddlewareContext<
    SchemaContract<Method, any, any, any, any>,
    any
  >,
  Output extends object = {}
> = (ctx: Input & { data: Partial<Output> }) => Promise<Output>;

export type MiddlewareRequest<
  C extends SchemaContract<Method, any, any, any, any>
> = Pick<
  HttpRequest<
    never,
    InferSchema<C["query"]>,
    InferSchema<C["params"]>,
    InferSchema<C["headers"]>
  >,
  "headers" | "query" | "params" | "url"
>;

export type MiddlewareContext<
  C extends SchemaContract<Method, any, any, any, any>,
  D extends object = {}
> = MiddlewareRequest<C> & {
  data: Partial<D>;
};

// Intersects all middleware outputs into a single `data` type
export type MergeMiddlewareOutput<M extends Array<Middleware<any, any>>> =
  M extends Array<Middleware<any, infer R>> ? UnionToIntersection<R> : {};

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export type InferMiddleware<T> = T extends (
  options: infer Opt
) => Middleware<any, infer Out>
  ? { options: Opt; output: Out }
  : never;

export function middleware<
  Input extends MiddlewareContext<
    SchemaContract<Method, any, any, any, any>,
    any
  >
>() {
  return new MiddlewareBuilder<Input, {}, undefined>();
}

export class MiddlewareBuilder<
  In extends MiddlewareContext<any, any>,
  Out extends object,
  Opt extends object | undefined
> {
  /** Add or change handler options (e.g. validation config) */
  options<Opt extends object>(): MiddlewareBuilder<In, Out, Opt> {
    return this as unknown as MiddlewareBuilder<In, Out, Opt>;
  }

  /** Specify the output shape for this middleware */
  output<Out extends object>(): MiddlewareBuilder<In, Out, Opt> {
    return this as unknown as MiddlewareBuilder<In, Out, Opt>;
  }

  /**
   * Finalize the middleware with a handler function.
   * Returns a factory `(opts) => Middleware` that captures the Options generic.
   */
  handler(
    fn: (
      ctx: {
      headers: Record<keyof IncomingHeaders, string | string[]>;
        query: Record<string, unknown>;
        url: string;
        data: Partial<In>;
      },
      options: Opt extends object ? Opt : {}
    ) => Promise<Out>
  ): (options: Opt extends object ? Opt : {}) => Middleware<any, Out> {
    return (options: Opt extends object ? Opt : {}) => {
      return async (ctx) =>
        await fn(ctx, options as Opt extends object ? Opt : {});
    };
  }
}

export function createMiddleware<
  Opt extends ZodShape = {},
  Out extends ZodShape = {}
>(opts: {
  options: Opt;
  output: Out;
  handler: (
    ctx: {
      headers: Record<keyof IncomingHeaders, string | string[]>;
      query: Record<string, unknown>;
      url: string;
      data: Partial<z.infer<ZodObject<Out>>>;
    },
    options: z.infer<ZodObject<Opt>>
  ) => Promise<z.infer<ZodObject<Out>>>;
}) {
  return (options: z.infer<ZodObject<Opt>>) => {
    const mw: Middleware<any, z.infer<ZodObject<Out>>> = async (ctx) => {
      return await opts.handler(ctx, options);
    };
    return mw;
  };
}
