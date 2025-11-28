// Test to verify that ContentType is properly extracted in SchemaContract
import { createContract } from "../contract/index";
import { z } from "zod";

// Test POST contract with JSON body
const jsonContract = createContract({
  method: "post",
  path: "/api/users",
  input: {
    type: "json",
    body: {
      name: z.string(),
      email: z.string().email(),
    },
    headers: {
      authorization: z.string().startsWith("Bearer "),
    },
  },
  output: {
    201: {
      id: z.string(),
      name: z.string(),
    },
  },
  errors: {
    code: ["ERR_INVALID_SESSION_ID"],
  },
});

// Test POST contract with form body
const formContract = createContract({
  method: "post",
  path: "/api/login",
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
      token: z.string(),
    },
  },
  errors: {
    code: ["ERR_INVALID_SESSION_ID"],
  },
});

// Test GET contract (no ContentType)
const getContract = createContract({
  method: "get",
  path: "/api/users/:id",
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
    },
  },
  errors: {
    code: ["ERR_INVALID_SESSION_ID"],
  },
});

// Verify the contentType is correctly extracted
console.log("JSON Contract contentType:", jsonContract.type); // Should be "json"
console.log("Form Contract contentType:", formContract.type); // Should be "form"
console.log("GET Contract contentType:", getContract.type); // Should be undefined

// Type-level test - these should compile without errors
const jsonContentType: "json" | undefined = jsonContract.type;
const formContentType: "form" | undefined = formContract.type;
const getContentType: undefined = getContract.type;

export { jsonContract, formContract, getContract };
