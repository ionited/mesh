// --- Utility types ---

export type DenyInputKeys<T, Disallowed> = T extends Disallowed ? never : T;
export type StringLiteral<T> = T extends string
  ? string extends T
    ? never
    : T
  : never;

export type ResolvedDependencyValue = unknown;
export type ResolvedDependencies = object;

export type Factory<CR extends ResolvedDependencies> = (
  resolvers: CR
) => ResolvedDependencyValue;

export type Resolvers<CR extends ResolvedDependencies> = {
  [K in keyof CR]?: Factory<CR>;
};

// --- Public DI interface ---
export interface IDIContainer<CR extends object = {}> {
  add: <N extends string, R extends Factory<CR>>(
    name: StringLiteral<DenyInputKeys<N, keyof CR>>,
    resolver: R
  ) => IDIContainer<InferContainerType<CR & { [K in N]: ReturnType<R> }>>;

  clone: () => IDIContainer<CR>;

  extend: <E extends (container: IDIContainer<CR>) => IDIContainer>(
    factory: E
  ) => ReturnType<E>;

  get: <K extends keyof CR>(name: K) => CR[K];

  has: (name: string) => boolean;

  merge: <OCR extends ResolvedDependencies>(
    container: DIContainer<OCR>
  ) => IDIContainer<InferContainerType<CR & OCR>>;

  update: <N extends keyof CR, R extends Factory<CR>>(
    name: StringLiteral<N>,
    resolver: R
  ) => IDIContainer<
    InferContainerType<{ [K in N]: ReturnType<R> } & Omit<CR, N>>
  >;
  dependencyKeys: () => LiteralKeys<CR>[];

  dispose: () => Promise<void>;
}

// --- DI Implementation ---
const containerMethods = ["add", "get", "extend", "update"] as const;
const RESERVED_NAMES = new Set<string>(containerMethods);

export class DIContainer<CR extends object = {}> {
  protected resolvedDependencies: Partial<CR> = {};
  protected resolvers: Resolvers<CR> = {};
  private context: CR = {} as CR;

  constructor() {
    this.context = new Proxy(this, {
      get: (target, prop) => {
        const name = prop.toString();
        if (RESERVED_NAMES.has(name)) {
          throw new IncorrectInvocationError();
        }
        return target[name as keyof this];
      },
    }) as unknown as CR;
  }

  public add<N extends string, R extends Factory<CR>>(
    name: StringLiteral<DenyInputKeys<N, keyof CR>>,
    resolver: R
  ): IDIContainer<InferContainerType<CR & { [K in N]: ReturnType<R> }>> {
    if (RESERVED_NAMES.has(name)) throw new ForbiddenNameError(name);
    if (this.has(name)) throw new DenyOverrideDependencyError(name);
    this.setValue(name, resolver);
    return this as unknown as IDIContainer<
      InferContainerType<CR & { [K in N]: ReturnType<R> }>
    >;
  }

  public clone(): DIContainer<CR> {
    const { resolvedDependencies, resolvers } = this.export();
    return new ClonedDiContainer(resolvers, resolvedDependencies);
  }

  public export(): {
    resolvedDependencies: Partial<CR>;
    resolvers: Resolvers<CR>;
  } {
    return {
      resolvedDependencies: this.resolvedDependencies,
      resolvers: this.resolvers,
    };
  }

  public extend<E extends (container: IDIContainer<CR>) => IDIContainer>(
    factory: E
  ): ReturnType<E> {
    return factory(this as unknown as IDIContainer<CR>) as ReturnType<E>;
  }

  public get<K extends keyof CR>(name: K): CR[K] {
    if (Object.prototype.hasOwnProperty.call(this.resolvedDependencies, name)) {
      const val = this.resolvedDependencies[name];
      if (val !== undefined) return val as CR[K];
    }
    const resolver = this.resolvers[name];
    if (!resolver) throw new DependencyIsMissingError(name as string);
    const value = resolver(this.context) as CR[K];
    this.resolvedDependencies[name] = value;
    return value;
  }

  public has(name: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.resolvers, name);
  }

  public merge<OCR extends ResolvedDependencies>(
    other: DIContainer<OCR>
  ): IDIContainer<InferContainerType<CR & OCR>> {
    const { resolvers, resolvedDependencies } = other.export();
    return new ClonedDiContainer(
      {
        ...(this.resolvers as Resolvers<CR & OCR>),
        ...(resolvers as Resolvers<CR & OCR>),
      },
      {
        ...(this.resolvedDependencies as Partial<CR & OCR>),
        ...(resolvedDependencies as Partial<CR & OCR>),
      }
    ) as unknown as IDIContainer<InferContainerType<CR & OCR>>;
  }

  public update<N extends keyof CR, R extends Factory<CR>>(
    name: StringLiteral<N>,
    resolver: R
  ): IDIContainer<
    InferContainerType<{ [K in N]: ReturnType<R> } & Omit<CR, N>>
  > {
    if (RESERVED_NAMES.has(name)) throw new ForbiddenNameError(name);
    if (!this.has(name)) throw new DependencyIsMissingError(name);
    this.setValue(name, resolver);
    return this as unknown as IDIContainer<
      InferContainerType<{ [K in N]: ReturnType<R> } & Omit<CR, N>>
    >;
  }

  public async dispose(): Promise<void> {
    const values = Object.values(this.resolvedDependencies);

    for (const dep of values) {
      if (
        dep &&
        typeof dep === "object" &&
        typeof (dep as { dispose?: unknown }).dispose === "function"
      ) {
        await (dep as { dispose: () => void | Promise<void> }).dispose();
      }
    }
  }

  public dependencyKeys(): LiteralKeys<CR>[] {
    return Object.keys(this.resolvers) as LiteralKeys<CR>[];
  }

  protected setResolvers<XR extends ResolvedDependencies>(
    resolvers: Resolvers<XR>,
    resolved: Partial<XR>
  ) {
    if (Object.keys(this.resolvers).length > 0) {
      throw new Error("Cannot reset resolvers after initialization.");
    }
    this.resolvers = resolvers as unknown as Resolvers<CR>;
    this.resolvedDependencies = resolved as unknown as Partial<CR>;
    for (const key of Object.keys(this.resolvers)) {
      this.addContainerProperty(key);
    }
  }

  private addContainerProperty(name: string) {
    if (!Object.prototype.hasOwnProperty.call(this, name)) {
      Object.defineProperty(this, name, {
        get: () => this.get(name as keyof CR),
      });
    }
  }

  private setValue(name: string, resolver: Factory<CR>) {
    this.resolvers = {
      ...this.resolvers,
      [name]: resolver,
    };
    this.addContainerProperty(name);
  }
}

// --- Cloning ---
class ClonedDiContainer<CR extends object = {}> extends DIContainer<CR> {
  constructor(resolvers: Resolvers<CR>, resolved: Partial<CR>) {
    super();
    this.setResolvers(resolvers, resolved);
  }
}

// --- Errors ---
export class DenyOverrideDependencyError extends Error {
  constructor(name: string) {
    super(`Dependency '${name}' already exists. Use 'update' instead.`);
  }
}

export class DependencyIsMissingError extends Error {
  constructor(name: string) {
    super(`Dependency '${name}' is not defined.`);
  }
}

export class ForbiddenNameError extends Error {
  constructor(name: string) {
    super(`'${name}' is a reserved container method name.`);
  }
}

export class IncorrectInvocationError extends Error {
  constructor() {
    super(`Cannot access method from container context.`);
  }
}

// --- Factory ---
export function createContainer<CR extends object = {}>() {
  return new DIContainer<CR>();
}

// --- Type Flattening ---
export type InferContainerType<T> = T extends object
  ? { [K in keyof T]: T[K] }
  : never;

export type InferDependency<
  T extends IDIContainer<any>,
  K extends keyof InferContainerType<T>
> = InferContainerType<T>[K];

export type InferDependencyKeys<T extends IDIContainer<any>> =
  keyof InferContainerType<T>;

export type InferDependencyKeyLiterals<T extends IDIContainer<any>> =
  InferDependencyKeys<T> extends string ? InferDependencyKeys<T> : never;

type LiteralKeys<T> = Extract<keyof T, string>;

export type Simplify<T> = T extends object
  ? { [K in keyof T]: Simplify<T[K]> }
  : T;

