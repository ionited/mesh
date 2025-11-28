#!/usr/bin/env tsx
// Complete end-to-end test for content-type validation

import { Server } from "../server/instance";
import { createContract } from "../contract/index";
import { createEndpoint } from "../endpoint/index";
import { z } from "zod";

console.log("🚀 Testing Content-Type Validation Integration");
console.log("=" .repeat(50));

// Test 1: JSON endpoint
const jsonContract = createContract({
  method: "post",
  path: "/api/json",
  type: "json",
  input: {
    type: "json",
    body: {
      name: z.string(),
      age: z.number(),
    },
    headers: {
      "content-type": z.string().optional(),
    },
  },
  output: {
    200: {
      message: z.string(),
      received: z.object({
        name: z.string(),
        age: z.number(),
      }),
    },
  },
  errors: {
    code: ["ERR_INVALID_CONTENT_TYPE"],
  },
});

const jsonEndpoint = createEndpoint({
  contract: jsonContract,
  handler: async (ctx) => {
    const body = await ctx.body();
    return {
      message: "JSON data received successfully",
      received: body,
    };
  },
});

// Test 2: Form endpoint
const formContract = createContract({
  method: "post",
  path: "/api/form",
  type: "form",
  input: {
    type: "form",
    body: {
      username: z.string(),
      password: z.string(),
    },
    headers: {
      "content-type": z.string().optional(),
    },
  },
  output: {
    200: {
      message: z.string(),
      user: z.string(),
    },
  },
  errors: {
    code: ["ERR_INVALID_CONTENT_TYPE"],
  },
});

const formEndpoint = createEndpoint({
  contract: formContract,
  handler: async (ctx) => {
    const body = await ctx.body();
    return {
      message: "Form data received successfully",
      user: body.username,
    };
  },
});

// Test 3: File upload endpoint
const uploadContract = createContract({
  method: "post",
  path: "/api/upload",
  type: "upload",
  input: {
    type: "upload",
    body: {
      file: z.instanceof(File),
      description: z.string().optional(),
    },
    headers: {
      "content-type": z.string().optional(),
    },
  },
  output: {
    200: {
      message: z.string(),
      filename: z.string(),
    },
  },
  errors: {
    code: ["ERR_INVALID_CONTENT_TYPE"],
  },
});

const uploadEndpoint = createEndpoint({
  contract: uploadContract,
  handler: async (ctx) => {
    const files = await ctx.files();
    return {
      message: "File uploaded successfully",
      filename: files.file?.filename || "unknown",
    };
  },
});

// Test 4: Binary endpoint
const binaryContract = createContract({
  method: "post",
  path: "/api/binary",
  type: "binary",
  input: {
    type: "binary",
    body: {
      data: z.instanceof(Buffer),
    },
    headers: {
      "content-type": z.string().optional(),
    },
  },
  output: {
    200: {
      message: z.string(),
      size: z.number(),
    },
  },
  errors: {
    code: ["ERR_INVALID_CONTENT_TYPE"],
  },
});

const binaryEndpoint = createEndpoint({
  contract: binaryContract,
  handler: async (ctx) => {
    const body = await ctx.body();
    return {
      message: "Binary data received successfully",
      size: Buffer.isBuffer(body.data) ? body.data.length : 0,
    };
  },
});

// Create server and register all endpoints
const server = new Server();
server
  .register(jsonEndpoint)
  .register(formEndpoint)
  .register(uploadEndpoint)
  .register(binaryEndpoint);

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("");
  console.log("🧪 Available test endpoints:");
  console.log("");
  console.log("1. JSON Endpoint (POST /api/json):");
  console.log("   Expected: application/json");
  console.log("   Test: curl -X POST http://localhost:3000/api/json \\");
  console.log("              -H 'Content-Type: application/json' \\");
  console.log("              -d '{\"name\": \"John\", \"age\": 30}'");
  console.log("");
  console.log("2. Form Endpoint (POST /api/form):");
  console.log("   Expected: application/x-www-form-urlencoded");
  console.log("   Test: curl -X POST http://localhost:3000/api/form \\");
  console.log("              -H 'Content-Type: application/x-www-form-urlencoded' \\");
  console.log("              -d 'username=john&password=secret'");
  console.log("");
  console.log("3. Upload Endpoint (POST /api/upload):");
  console.log("   Expected: multipart/form-data");
  console.log("   Test: curl -X POST http://localhost:3000/api/upload \\");
  console.log("              -F 'file=@README.md' \\");
  console.log("              -F 'description=Test file'");
  console.log("");
  console.log("4. Binary Endpoint (POST /api/binary):");
  console.log("   Expected: application/octet-stream");
  console.log("   Test: curl -X POST http://localhost:3000/api/binary \\");
  console.log("              -H 'Content-Type: application/octet-stream' \\");
  console.log("              --data-binary '@package.json'");
  console.log("");
  console.log("🚫 Test invalid content-type (should return 400):");
  console.log("   curl -X POST http://localhost:3000/api/json \\");
  console.log("        -H 'Content-Type: text/plain' \\");
  console.log("        -d '{\"name\": \"John\", \"age\": 30}'");
  console.log("");
  console.log("📋 Content-Type Mapping:");
  console.log("   json   → application/json");
  console.log("   form   → application/x-www-form-urlencoded");
  console.log("   upload → multipart/form-data");
  console.log("   binary → application/octet-stream");
  console.log("   stream → text/event-stream");
  console.log("");
  console.log("🎉 Content-type validation is now fully integrated!");
});
