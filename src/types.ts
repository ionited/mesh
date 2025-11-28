export type Unpack<T> = {
  [K in keyof T]: Unpack<T[K]>;
};

// export type Simplify<T> = T extends unknown ? { [K in keyof T]: T[K] } : T;
export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {}


export type Merge<T, U> = Simplify<T & U>;


// const jsonContent = <
//   T extends ZodSchema,
// >(schema: T,
//   description: string,
// ) => {
//   return {
//     content: {
//       "application/json": {
//         schema,
//       },
//     },
//     description,
//   };
// };

// export default jsonContent;


export const contentTypes = {
  json: "application/json",
  upload: "multipart/form-data",
  binary: "application/octet-stream",
  stream: "text/event-stream",
  form: "application/x-www-form-urlencoded",
} as const;

export type ContentType = keyof typeof contentTypes;
export type MimeType = (typeof contentTypes)[ContentType];

// export type EmptyObject = z.output<EmptySchema>;
// export type EmptySchema = ZodRecord<ZodString, ZodNever>;
// export type FlatObject = Record<string, unknown>;



export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

export type RemoveBlankRecord<T> = T extends Record<infer K, unknown>
  ? K extends string
    ? T
    : never
  : never

export type IfAnyThenEmptyObject<T> = 0 extends 1 & T ? {} : T


/**
 * symbol keys are omitted through `JSON.stringify`
 */
type OmitSymbolKeys<T> = { [K in keyof T as K extends symbol ? never : K]: T[K] }


/**
 * Useful to flatten the type output to improve type hints shown in editors. And also to transform an interface into a type to aide with assignability.
 * @copyright from sindresorhus/type-fest
 */

/**
 * A simple extension of Simplify that will deeply traverse array elements.
 */
export type SimplifyDeepArray<T> = T extends any[]
  ? { [E in keyof T]: SimplifyDeepArray<T[E]> }
  : Simplify<T>

export type InterfaceToType<T> = T extends Function ? T : { [K in keyof T]: InterfaceToType<T[K]> }

export type RequiredKeysOf<BaseType extends object> = Exclude<
  {
    [Key in keyof BaseType]: BaseType extends Record<Key, BaseType[Key]> ? Key : never
  }[keyof BaseType],
  undefined
>

export type HasRequiredKeys<BaseType extends object> = RequiredKeysOf<BaseType> extends never
  ? false
  : true

export type IsAny<T> = boolean extends (T extends never ? true : false) ? true : false


export type StringLiteralUnion<T> = T | (string & Record<never, never>)
