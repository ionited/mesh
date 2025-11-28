// Complete test demonstrating ContentType extraction and validation
import { createContract } from "../contract/index";
import { Server } from "../server/instance";
import { endpoint } from "../endpoint/index";
import { z } from "zod";

// Create contracts with different ContentTypes
const jsonContract = createContract({
  method: "post",
  path: "/api/json/:id",
  type: "json",
  input: {
    params: {
      id: z.string(),
    },
    body: {
      message: z.string(),
    },
    headers: {
      "accept-ranges": z.string(),
      "last-modified": z.string().optional(),
    },
  },
  output: {
    200: {
      result: z.string(),
    }
  },
  errors: {
    code: ["ERR_INVALID_CONTENT_TYPE"],
  },
});

const formContract = createContract({
  method: "post",
  path: "/api/form",
  type: "form",
  input: {
    body: {
      username: z.string(),
      password: z.string(),
    },
    headers: {
      "content-type": z.string(),
    },
  },
  output: {
    200: {
      token: z.string(),
    }
  },
  errors: {
    code: ["ERR_INVALID_CONTENT_TYPE"],
  },
});

// Create endpoints
const jsonEndpoint = endpoint({ contract: jsonContract })
  .handler(async (ctx) => {
    const body = await ctx.body();
    return { result: `Received: ${body.message}` };
  });

const formEndpoint = endpoint({ contract: formContract })
  .handler(async (ctx) => {
    const body = await ctx.body();
    return { token: `token_for_${body.username}` };
  });

// Create server and register endpoints
const server = new Server();
server.register(jsonEndpoint);
server.register(formEndpoint);

console.log("✅ Server with ContentType validation created successfully!");
console.log("JSON Contract contentType:", jsonContract.type);
console.log("Form Contract contentType:", formContract.type);

// Verify types are correctly inferred
const jsonType: "json" = jsonContract.type!;
const formType: "form" = formContract.type!;

console.log("✅ ContentType types correctly inferred!");
console.log("JSON type:", jsonType);
console.log("Form type:", formType);

export { server, jsonContract, formContract };
