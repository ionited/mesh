// Test the Server class with content-type validation
import { Server } from "../server/instance";
import { createContract } from "../contract/index";
import { createEndpoint } from "../endpoint/index";
import { z } from "zod";

// Create a simple contract with JSON content-type
const testContract = createContract({
  method: "post",
  path: "/test",
  type: "json", // Specify the content-type as JSON
  input: {
    body: {
      message: z.string(),
    },
    headers: {
      "content-type": z.string().optional(),
    },
  },
  output: {
    200: {
      success: z.boolean(),
      data: z.string(),
    },
  },
  errors: {
    code: ["ERR_INVALID_CONTENT_TYPE"],
  },
});

// Create an endpoint
const testEndpoint = createEndpoint({
  contract: testContract,
  handler: async (ctx) => {
    const body = await ctx.body();
    return {
      success: true,
      data: `Received: ${body.message}`,
    };
  },
});

// Create and configure server
const server = new Server();
server.register(testEndpoint);

// Start server on port 3000
server.listen(3000, () => {
  console.log("✅ Server started on port 3000");
  console.log("🔄 Content-type validation is now integrated!");
  console.log("");
  console.log("Test endpoints:");
  console.log("POST /test - expects application/json");
  console.log("");
  console.log("Test with curl:");
  console.log("# Valid request:");
  console.log(`curl -X POST http://localhost:3000/test \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"message": "Hello World"}'`);
  console.log("");
  console.log("# Invalid content-type:");
  console.log(`curl -X POST http://localhost:3000/test \\`);
  console.log(`  -H "Content-Type: text/plain" \\`);
  console.log(`  -d '{"message": "Hello World"}'`);
});
