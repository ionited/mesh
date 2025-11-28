import { getUserContract } from "./example-contract";
import { endpoint } from "../endpoint/index";
import { middleware, Middleware } from "../middleware/index";
import { createRouter } from "../router/index";

type UserContract = typeof getUserContract;

// const authMiddleware: Middleware<
//   Pick<HttpRequest<any, any, any>, "headers">,
//   { user: { id: string; name: string } }
// > = async (ctx) => {
//   const user = await getUserFromHeader(ctx.headers.authorization);
//   return { user };
// };

// const authMiddleware: Middleware<any, { userId: string }> = async (ctx) => {
//   const token = ctx.headers.authorization;
//   const userId = await verifyAuthToken(token);
//   return { userId };
// };

const auth = middleware()
  .options<{ required: boolean }>()
  .output<{ userId: string }>()
  .handler(async (ctx, opts) => {
    const token = ctx.headers.authorization;
    if (!token && opts.required) {
      throw new Error("Missing token");
    }
    return { userId: "abc-123" };
  });

const geoMiddleware: Middleware<any, { region: string }> = async (ctx) => {
  const region = ctx.query.region ?? "eu-central";
  return { region };
};

const adminRouter = createRouter()
  .base("/admin")
  .middlewares([auth({ required: true }), geoMiddleware])
  .build();


endpoint({ contract: getUserContract })
  // .router(adminRouter)
  .use([auth({ required: true }), geoMiddleware])
  // .use(auth({ required: true }))
  // .use(geoMiddleware)

  .handler(async (ctx) => {
    if (!ctx.params.id) {
      return ctx.error("ERR_FROM_PDF_API");
    }
    ctx.data; // typed as string ✅
    return { 
      id: "123", 
      name: "John Doe",
      email: "john.doe@example.com",
      createdAt: new Date().toISOString()
    };
  });
