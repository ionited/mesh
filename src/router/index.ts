import { Method, SchemaContract } from "../contract/index";
import {
  MergeMiddlewareOutput,
  Middleware,
  MiddlewareContext,
} from "../middleware/index";

export function createRouter<Global extends object = {}>() {
  return new RouterBuilder<Global>();
}

export class RouterBuilder<D extends object = {}> {
  private _middlewares: Middleware<
    MiddlewareContext<SchemaContract<Method, any, any, any, any>, D>,
    any
  >[] = [];
  private _basePath?: string;

  // use<M extends Middleware<any, any>>(
  //   mw: M
  // ): RouterBuilder<Global & Awaited<ReturnType<M>>> {
  //   this._middlewares.push(mw);
  //   return this as RouterBuilder<Global & Awaited<ReturnType<M>>>;
  // }

  middlewares<M extends Array<Middleware<any, any>>>(
    mw: M
  ): RouterBuilder<MergeMiddlewareOutput<M>> {
    this._middlewares = mw;
    return this as RouterBuilder<MergeMiddlewareOutput<M>>;
  }

  base(path: string): this {
    this._basePath = path;
    return this;
  }

  build() {
    return {
      middlewares: this._middlewares,
      basePath: this._basePath,
    };
  }
}
