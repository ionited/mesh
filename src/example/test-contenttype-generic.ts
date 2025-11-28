// Test ContentType as generic parameter
import { createContract } from "../contract/index";
import { z } from "zod";

// Test with specific ContentType - this should work
const jsonContract = createContract({
  method: "post",
  path: "/json-test",
  type: "json", // This should be strongly typed
  input: {
    body: {
      name: z.string(),
      email: z.string().email(),
    },
    headers: {
      authorization: z.string().optional(),
    },
  },
  output: {
    200: {
      success: z.boolean(),
    }
  },
  errors: {
    code: ["ERR_INVALID_CONTENT_TYPE"],
  },
});

// Test with GET method and body - this should fail
const getContractWithBody = createContract({
  method: "get", // GET method
  path: "/bad-get",
  input: {
    // type: "json", // This should not be allowed for GET
    // body: {
    //   name: z.string(),
    // },
    headers: {
      authorization: z.string().optional(),
    },
  },
  output: {
    200: {
      data: z.string(),
    }
  },
  errors: {
    code: ["ERR_INVALID_CONTENT_TYPE"],
  },
});

console.log("JSON contract type:", jsonContract.type);
console.log("GET contract type:", getContractWithBody.type);
