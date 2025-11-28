import { createContract, InferContract, InferSchema } from "../contract/index";
import { z } from "zod";

// ✅ Valid GET contract with params, output and error schema
export const getUserContract = createContract({
  docs: {
    description: "Get user by ID",
    tags: ["users"],
    summary: "Fetch a user by their unique ID",
  },
  method: "get",
  path: "/users/:id",
  input: {
    params: { id: z.string() },
    headers: {
      authorization: z.string().startsWith("Bearer ").optional(),
    },
  },
  output: {
    200: {
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      createdAt: z.string().datetime(),
    },
  },
  errors: {
    code: [
      "ERR_INVALID_OFFER_ID",
      "ERR_INVALID_SESSION_ID",
      "ERR_FROM_PDF_API",
    ],
  },
});

// ✅ POST contract with JSON body
export const createUserContract = createContract({
  docs: {
    description: "Create a new user",
    tags: ["users"],
    summary: "Create a new user account",
  },
  method: "post",
  path: "/users",
  type: "json", // Explicitly set ContentType to JSON
  input: {
    body: {
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
    },
    headers: {
      authorization: z.string().startsWith("Bearer "),
    },
  },
  output: {
    201: {
      id: z.string(),
      name: z.string(),
      email: z.string(),
    },
  },
  errors: {
    code: ["ERR_INVALID_SESSION_ID", "ERR_FROM_PDF_API"],
  },
});

// ✅ POST contract with upload body (for file uploads)
export const uploadAvatarContract = createContract({
  docs: {
    description: "Upload user avatar",
    tags: ["users", "files"],
    summary: "Upload a new avatar image for user",
  },
  method: "post",
  path: "/users/:id/avatar",
  type: "upload", // Explicitly set ContentType to upload
  input: {
    body: {
      avatar: z.instanceof(File), // File upload
      description: z.string().optional(),
    },
    params: { id: z.string() },
    headers: {
      authorization: z.string().startsWith("Bearer "),
    },
  },
  output: {
    200: {
      id: z.string(),
      avatarUrl: z.string().url(),
      message: z.string(),
    },
  },
  errors: {
    code: ["ERR_INVALID_SESSION_ID", "ERR_FROM_PDF_API"],
  },
});

// ✅ POST contract with URL-encoded form body
export const loginContract = createContract({
  docs: {
    description: "User login",
    tags: ["auth"],
    summary: "Authenticate user with credentials",
  },
  method: "post",
  path: "/auth/login",
  type: "form", // Explicitly set ContentType to form
  input: {
    body: {
      email: z.string().email(),
      password: z.string(),
      remember: z.boolean().optional(),
    },
    headers: {
      "content-type": z.string().optional(),
    },
  },
  output: {
    200: {
      token: z.string(),
      user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
      }),
    },
  },
  errors: {
    code: ["ERR_INVALID_SESSION_ID"],
  },
});

// ✅ POST contract with binary body (file upload)
export const uploadDocumentContract = createContract({
  docs: {
    description: "Upload document",
    tags: ["documents"],
    summary: "Upload a binary document file",
  },
  method: "post",
  path: "/documents",
  type: "binary", // application/octet-stream
  input: {
    body: {
      file: z.instanceof(Buffer), // Binary data
    },
    headers: {
      "content-type": z.string(),
      authorization: z.string().startsWith("Bearer "),
    },
  },
  output: {
    201: {
      id: z.string(),
      filename: z.string(),
      size: z.number(),
      uploadedAt: z.string().datetime(),
    },
  },
  errors: {
    code: ["ERR_INVALID_SESSION_ID", "ERR_FROM_PDF_API"],
  },
});

// ✅ POST contract with stream body (server-sent events)
export const createNoteContract = createContract({
  docs: {
    description: "Create a streaming note",
    tags: ["notes"],
    summary: "Create a new note with streaming content",
  },
  method: "post",
  path: "/notes",
  type: "stream", // text/event-stream
  input: {
    body: {
      content: z.string(), // Streaming content
    },
    headers: {
      authorization: z.string().startsWith("Bearer "),
    },
  },
  output: {
    201: {
      id: z.string(),
      content: z.string(),
      createdAt: z.string().datetime(),
    },
  },
  errors: {
    code: ["ERR_INVALID_SESSION_ID"],
  },
});

// ❌ Invalid HTTP method
createContract({
  // @ts-expect-error - 'fetch' is not a valid Method
  method: "fetch",
  path: "/bad",
  output: { 200: {} },
});

// ❌ Invalid success code
createContract({
  method: "get",
  path: "/bad",
  // @ts-expect-error - 299 is not a valid SuccessCode
  output: { 299: {} },
});

// ❌ Invalid error code
createContract({
  method: "get",
  path: "/bad",
  output: { 200: {} },
  // @ts-expect-error - 'ERR_INVALID_OFFER' is not a valid ErrorCode
  errors: { code: ["ERR_INVALID_OFFER"] },
});

// Type inference examples
type GetUserParams = InferSchema<typeof getUserContract.params>;
type GetUserQuery = InferSchema<typeof getUserContract.query>;
type GetUserBody = typeof getUserContract.body;
type GetUserRes200 = InferSchema<(typeof getUserContract.responses)["200"]>;
type GetUserRes400 = InferSchema<(typeof getUserContract.responses)["400"]>;
type GetUserFullContract = InferContract<typeof getUserContract>;

type CreateUserBody = InferSchema<typeof createUserContract.body>;
type UploadAvatarBody = InferSchema<typeof uploadAvatarContract.body>;
type LoginBody = InferSchema<typeof loginContract.body>;
