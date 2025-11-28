// Content-Type handling demonstration
import { ContentType, contentTypes } from "../types";
import { createContract } from "../contract/index";
import { z } from "zod";

// Example showing how different content types are handled

// 1. JSON content (application/json)
export const jsonContract = createContract({
  docs: {
    description: "Handle JSON data",
    tags: ["demo"],
    summary: "Process JSON request body",
  },
  method: "post",
  path: "/api/json",
  type: "json", // maps to application/json
  input: {
    body: {
      name: z.string(),
      age: z.number(),
      email: z.string().email(),
    },
    headers: {
      "content-type": z.string().optional(),
    },
  },
  output: {
    200: {
      message: z.string(),
      data: z.object({
        name: z.string(),
        age: z.number(),
        email: z.string(),
      }),
    },
  },
});

// 2. Form data (application/x-www-form-urlencoded)  
export const formContract = createContract({
  docs: {
    description: "Handle form data",
    tags: ["demo"],
    summary: "Process URL-encoded form data",
  },
  method: "post", 
  type: "form", // maps to application/x-www-form-urlencoded
  path: "/api/form",
  input: {
    type: "form", // maps to application/x-www-form-urlencoded
    body: {
      username: z.string(),
      password: z.string(),
      remember: z.boolean().optional(),
    },
    headers: {
      "content-type": z.string().optional(),
    },
  },
  output: {
    200: {
      success: z.boolean(),
      token: z.string(),
    },
  },
});

// 3. File upload (multipart/form-data)
export const uploadContract = createContract({
  docs: {
    description: "Handle file uploads",
    tags: ["demo"],
    summary: "Process multipart form data with files",
  },
  type: "upload", // maps to multipart/form-data
  method: "post",
  path: "/api/upload",
  input: {
    body: {
      file: z.instanceof(File),
      description: z.string().optional(),
      category: z.string(),
    },
    headers: {
      authorization: z.string().startsWith("Bearer "),
    },
  },
  output: {
    201: {
      fileId: z.string(),
      filename: z.string(),
      size: z.number(),
      url: z.string().url(),
    },
  },
});

// 4. Binary data (application/octet-stream)
export const binaryContract = createContract({
  docs: {
    description: "Handle binary data",
    tags: ["demo"],
    summary: "Process raw binary data",
  },
  method: "post",
  path: "/api/binary",
  type: "binary", // maps to application/octet-stream
  input: {
    body: {
      data: z.instanceof(Buffer),
    },
    headers: {
      "content-length": z.string().optional(),
      authorization: z.string().startsWith("Bearer "),
    },
  },
  output: {
    200: {
      processed: z.boolean(),
      size: z.number(),
      checksum: z.string(),
    },
  },
});

// 5. Server-sent events (text/event-stream)
export const streamContract = createContract({
  docs: {
    description: "Handle streaming data",
    tags: ["demo"],
    summary: "Process server-sent events or streaming data",
  },
  method: "post",
  path: "/api/stream",
  type: "stream", // maps to text/event-stream
  input: {
    body: {
      events: z.string(),
    },
    headers: {
      "cache-control": z.string().optional(),
      authorization: z.string().startsWith("Bearer "),
    },
  },
  output: {
    200: {
      streamId: z.string(),
      eventCount: z.number(),
    },
  },
});

// Utility function to demonstrate content-type mapping
export function demonstrateContentTypeMapping() {
  console.log("ContentType to HTTP Header Mapping:");
  console.log("=====================================");
  
  for (const [key, value] of Object.entries(contentTypes)) {
    console.log(`${key.padEnd(8)} -> ${value}`);
  }
  
  console.log("\nExample Usage:");
  console.log("==============");
  console.log("1. JSON:   POST /api/json   with Content-Type: application/json");
  console.log("2. Form:   POST /api/form   with Content-Type: application/x-www-form-urlencoded");
  console.log("3. Upload: POST /api/upload with Content-Type: multipart/form-data");
  console.log("4. Binary: POST /api/binary with Content-Type: application/octet-stream");
  console.log("5. Stream: POST /api/stream with Content-Type: text/event-stream");
}

// Type checking examples
type JsonBody = typeof jsonContract.body;
type FormBody = typeof formContract.body;
type UploadBody = typeof uploadContract.body;
type BinaryBody = typeof binaryContract.body;
type StreamBody = typeof streamContract.body;
