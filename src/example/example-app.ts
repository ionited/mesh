// main.ts
import z from "zod";
import { Server } from "../server/instance";
import { createContract } from "../contract/index";
import { createEndpoint } from "../endpoint/index";
import { createMiddleware, InferMiddleware } from "../middleware/index";
import {
  InferServerContracts,
  InferServerContractsByPath,
} from "../server/types";

const getHelloContract = createContract({
  method: "get",
  path: "/users/:id",
  input: { 

    // type: "json",
    params: { id: z.string() },
    // headers: {
    //   authorization: z.string().optional(),
    // },
  },
  output: { 200: { message: z.string() } },
  errors: {
    code: [
      "ERR_INVALID_OFFER_ID",
      "ERR_INVALID_SESSION_ID",
      "ERR_FROM_PDF_API",
    ],
  },
});

// const auth = middleware()
//   .options<{ required: boolean }>()
//   .output<{ userId: string }>()
//   .handler(async (ctx, opts) => {
//     const token = ctx.headers.authorization;
//     if (!token && opts.required) {
//       throw new Error("Missing token");
//     }
//     return { userId: "abc-123" };
//   });

const auth = createMiddleware({
  options: { required: z.boolean() },
  output: { userId: z.string() },
  handler: async (ctx, opts) => {
    const token = ctx.headers.authorization;
    if (!token && opts.required) {
      throw new Error("Missing token");
    }
    return { userId: "abc-123" };
  },
});

export const getHelloEndpoint = createEndpoint({
  contract: getHelloContract,
  middlewares: [auth({ required: true })],
  handler: async (ctx) => {
    const id = ctx.data.userId;
    return { message: `Hello from user ${id}` };
  },
});

export type AuthMiddleware = InferMiddleware<typeof auth>;

const app = new Server().register(getHelloEndpoint);

app.listen(3000, () => {
  console.log("🚀 Server listening on http://localhost:3000");
});

export type contracts = InferServerContracts<typeof app>;

export type userId = InferServerContractsByPath<typeof app>["/users/:id"];
