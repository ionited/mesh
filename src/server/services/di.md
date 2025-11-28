# Strict Types Example


```typescript

import { DIContainer } from "../DIContainer";
import { Bar, Foo } from "./fakeClasses";

const container = new DIContainer()
  .add("a", () => 123)
  .add("b", ({ a }) => a)
  .add("c", () => "string")
  .add("bar", () => new Bar())
  .add("foo", ({ c, bar }) => new Foo(c, bar))
  // TS2339: Property d does not exist on type
  .add("foo2", ({ d, bar }) => new Foo(d, bar))
  // TS2345: Argument of type 'Bar' is not assignable to parameter of type 'string'.
  .add("foo2", ({ bar }) => new Foo(bar, bar));

const a: number = container.a;
const b: number = container.b;
const c: string = container.c;
const bar: Bar = container.bar;
const foo: Foo = container.foo;
// TS2339: Property z does not exist on typ
container.z;
// TS2345: Argument of type "y" is not assignable to parameter of type "a" | "b" | "c" | "bar" | "foo" | "foo2"
container.get("y");

```


### Async factory resolver

RSDI intentionally does not provide the ability to resolve asynchronous dependencies. The container works with
resources. All resources will be used sooner or later. The lazy initialization feature won't be of much benefit
in this case. At the same time, mixing synchronous and asynchronous resolution will cause confusion primarily for
the consumers.

The following approach will work in most scenarios.

```typescript
// UserRepository.ts
class UserRepository {
  public constructor(private readonly dbConnection: any) {} // some ORM that requires opened connection

  async findUser() {
    return await this.dbConnection.find(/*...params...*/);
  }
}

// configureDI.ts
import { createConnections } from "my-orm-library";
import { DIContainer } from "rsdi";

async function configureDI() {
  // initialize async factories before DI container initialisation
  const dbConnection = await createConnections();

  return new DIContainer()
    .add("dbConnection", dbConnection)
    .add("userRepository", ({ dbConnection }) => new UserRepository( dbConnection ));
}

// main.ts
const { userRepository } = diContainer;
```



## DI Container vs Context

```typescript
export const userRegistratorFactory = (repository: UserRepository) => {};

// VS

export const userRegistratorFactory = (context: {
  repository: UserRepository;
}) => {};
```

At first glance, the difference is not that big. Context works great when the number of dependencies in your application is
low. When a context starts storing a lot of dependencies, it becomes more difficult to use it. The context can be
structured i.e. `context: { users: { repository: UserRepository } }`, this will partially solve the problem, but moving
the component inside the context structure becomes a costly task where there are risks of errors.

When a context is passed to a component, it can use any components from the context. While this may seem like a good idea,
in big teams it can lead to redundantly cohesive project modules. Developers in different teams begin to pull everything
out of context, without thinking about the coherence in projects. Allocating a subsystem that is used by a context into
a microservice can be a much more expensive task.

The primary distinction between our use of context and dependency injection is that we don't transfer the container 
between layers. Instead, we retrieve high-level components with their dependencies pre-injected at the uppermost level. 
This could be in the form of a controller or even the entire application instance, which already possesses injected 
controllers.


```typescript
// router.ts
const configureRouter = (app: core.Express, diContainer: IDIContainer) => {
  const { usersController } = diContainer;
  app.route('/users')
    .get(usersController.actionIndex)
    .post(usersController.actionCreate);
}

// index.ts
const app = express();

const diContainer = configureDI();

configureRouter(app, diContainer)

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
```