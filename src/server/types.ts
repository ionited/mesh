import { Server } from "./instance";
import { SchemaContract, Method, InferContract } from "../contract/index";
import { Simplify } from "../types";

export type InferServerContracts<T> = T extends Server<infer Endpoints>
  ? {
      [K in keyof Endpoints]: Endpoints[K] extends { contract: infer C }
        ? C extends SchemaContract<Method, any, any, any, any>
          ? Simplify<InferContract<C>>
          : never
        : never;
    }
  : never;

export type InferServerContractsByPath<T> = T extends Server<infer Endpoints>
  ? {
      [E in Endpoints[number] as E extends { contract: { path: infer P } }
        ? P extends string
          ? P
          : never
        : never]: E extends { contract: infer C }
        ? C extends SchemaContract<Method, any, any, any, any>
          ? Simplify<InferContract<C>>
          : never
        : never;
    }
  : never;
