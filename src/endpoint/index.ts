import { Context } from "../context/index";
import {
  InferSuccessResponse,
  Method,
  SchemaContract,
} from "../contract/index";
import {
  MergeMiddlewareOutput,
  Middleware,
  MiddlewareContext,
} from "../middleware/index";
import { RouterBuilder } from "../router";

export class EndpointBuilder<
  C extends SchemaContract<Method, any, any, any, any>,
  D extends object = {}
> {
  private _contract: C;
  private _middlewares: Middleware<MiddlewareContext<C, D>, any>[] = [];

  constructor(options: { contract: C }) {
    this._contract = options.contract;
  }

  get contract(): C {
    return this._contract;
  }

  get middlewares(): Middleware<MiddlewareContext<C, D>, any>[] {
    return this._middlewares;
  }

  /** Append one middleware, widening D by its return type */
  use<M extends Middleware<MiddlewareContext<C, D>, any>>(
    middleware: M
  ): EndpointBuilder<C, D & Awaited<ReturnType<M>>>;
  use<M extends Middleware<MiddlewareContext<C, D>, any>[]>(
    middleware: M
  ): EndpointBuilder<C, D & MergeMiddlewareOutput<M>>;
  use(
    middleware:
      | Middleware<MiddlewareContext<C, D>, any>
      | Middleware<MiddlewareContext<C, D>, any>[]
  ): EndpointBuilder<C, D> {
    if (Array.isArray(middleware)) {
      this._middlewares.push(...middleware);
      return this as unknown as EndpointBuilder<
        C,
        D & MergeMiddlewareOutput<typeof middleware>
      >;
    }
    this._middlewares.push(middleware);
    return this as unknown as EndpointBuilder<
      C,
      D & Awaited<ReturnType<typeof middleware>>
    >;
  }

  /** Append multiple middlewares, merging their data into D */
  // middleware<M extends Array<Middleware<C, any>>>(
  //   middleware: M
  // ): EndpointBuilder<C, D & MergeMiddlewareData<M>> {
  //   this._middlewares.push(...middleware);
  //   return this as unknown as EndpointBuilder<C, D & MergeMiddlewareData<M>>;
  // }

  router<R extends ReturnType<InstanceType<typeof RouterBuilder<D>>["build"]>>(
    router: R
  ): EndpointBuilder<C, D & MergeMiddlewareOutput<R["middlewares"]>> {
    this._middlewares.push(...router.middlewares);
    return this as unknown as EndpointBuilder<
      C,
      D & MergeMiddlewareOutput<R["middlewares"]>
    >;
  }

  /**
   * Final build step: supply your handler and get back a fully‐typed endpoint descriptor.
   * ctx: typed by C and D; return type inferred from Contract<C>.
   */
  handler(fn: (ctx: Context<C, D>) => Promise<InferSuccessResponse<C>>): {
    contract: C;
    middlewares: Middleware<MiddlewareContext<C, D>, any>[];
    handler: (ctx: Context<C, D>) => Promise<InferSuccessResponse<C>>;
  } {
    return {
      contract: this._contract,
      middlewares: this._middlewares,
      handler: fn,
    };
  }
}

/** Entry‐point helper: begin a fresh builder */
export function endpoint<
  C extends SchemaContract<Method, any, any, any, any>,
  D extends object = {}
>(options: { contract: C }) {
  return new EndpointBuilder<C, D>(options);
}

export function createEndpoint<
  C extends SchemaContract<Method, any, any, any, any>,
  D extends object = {},
  M extends Middleware<any, any>[] = []
>(opts: {
  contract: C;
  middlewares?: M;
  handler: (
    ctx: Context<C, MergeMiddlewareOutput<M>>
  ) => Promise<InferSuccessResponse<C>>;
}) {
  let builder = new EndpointBuilder<C, D & MergeMiddlewareOutput<M>>({
    contract: opts.contract,
  });

  if (opts.middlewares) {
    builder.use(
      Array.isArray(opts.middlewares) ? opts.middlewares : [opts.middlewares]
    );
  }

  return builder.handler(opts.handler);
}
