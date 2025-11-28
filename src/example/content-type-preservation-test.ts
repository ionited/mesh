// Test to verify that ContentType is properly preserved in SchemaContract
import { createContract } from "../contract/index";
import { z } from "zod";

// Test contract with ContentType
const testContract = createContract({
  method: "get",
  path: "/test",
  input: {

    // type: "json", // This should be preserved as contentType
    // body: {
    //   name: z.string(),
    //   email: z.string().email(),
    // },
    headers: {
      authorization: z.string().optional(),
      "x-custom-header": z.string().optional(),
    },
    // headers: {
    //   'hjhh': z.string().optional(),
    // },
  },
  output: {
    200: {
      success: z.boolean(),
      message: z.string(),
    }
  },
  errors: {
    code: ["ERR_INVALID_CONTENT_TYPE"],
  },
});

// Verify ContentType is preserved
console.log("Contract contentType:", testContract.type); // Should be "json"
console.log("Contract method:", testContract.method); // Should be "post" 
console.log("Contract path:", testContract.path); // Should be "/test"

// Test another contract with different ContentType (POST method for body)
const uploadContract = createContract({
  method: "post", // Changed from "get" to "post" - GET methods cannot have bodies
  path: "/upload",
  // type: "json", // Explicitly set ContentType to "upload"
  type: "upload", // This should be preserved as contentType
  input: {
    body: {
      file: z.instanceof(File),
      description: z.string().optional(),
    },
    headers: {
      authorization: z.string(),
      "last-modified": z.string().optional(),
    },
  },
  output: {
    200: {
      fileId: z.string(),
      url: z.string(),
    }
  },
  errors: {
    code: ["ERR_INVALID_CONTENT_TYPE"],
  },
});

console.log("Upload contract contentType:", uploadContract.type); // Should be "upload"

// Test contract without ContentType (GET request)
const getContract = createContract({
  method: "get",
  path: "/users/:id",

  input: {
    params: { id: z.string() },
    headers: {
      authorization: z.string().optional(),
    },
  },
  output: {
    200: {
      id: z.string(),
      name: z.string(),
    }
  },
  errors: {
    code: ["ERR_INVALID_CONTENT_TYPE"],
  },
});

console.log("GET contract contentType:", getContract.type); // Should be undefined

export { testContract, uploadContract, getContract };
