export type FormDataSchema = {
  [key: string]:
    | { kind: "value"; type: "string" | "number" | "integer" }
    | { kind: "file"; type: "application/json"; schema: any }
    | { kind: "file"; type: "application/octet-stream" };
};

export type formDataType<FDS extends FormDataSchema> = {
  -readonly [K in keyof FDS]: FDS[K] extends { kind: "value"; type: "string" }
    ? string
    : FDS[K] extends { kind: "value"; type: "number" }
    ? number
    : FDS[K] extends { kind: "value"; type: "integer" }
    ? number
    : FDS[K] extends {
        kind: "file";
        type: "application/json";
        schema: infer S extends any;
      }
    ? any
    : FDS[K] extends { kind: "file"; type: "application/octet-stream" }
    ? Blob
    : never;
};

// Update BodySchema to use MimeType for broader compatibility
export type BodySchema =
  | { type: "text/plain" }
  | { type: "application/json"; schema?: any } // Made schema optional
  | { type: "multipart/form-data"; schema?: FormDataSchema } // Made schema optional
  | { type: "application/octet-stream" }
  | { type: "text/event-stream" } // Added
  | { type: "application/x-www-form-urlencoded" } // Added
  | { type: `image/${string}` }
  | { type: `audio/${string}` }
  | { type: `video/${string}` };

export type bodyType<BS extends BodySchema> = BS extends { type: "text/plain" }
  ? { type: "text/plain"; data: string }
  : BS extends { type: "application/json"; schema: infer S extends any }
  ? { type: "application/json"; data: any }
  : BS extends {
      type: "multipart/form-data";
      schema: infer S extends FormDataSchema;
    }
  ? { type: "multipart/form-data"; data: formDataType<S> }
  : BS extends { type: "application/octet-stream" }
  ? { type: "application/octet-stream"; data: Blob }
  : BS extends { type: "text/event-stream" } // Added
  ? { type: "text/event-stream"; data: string } // Added
  : BS extends { type: "application/x-www-form-urlencoded" } // Added
  ? { type: "application/x-www-form-urlencoded"; data: string } // Added
  : BS extends { type: `image/${infer M extends string}` }
  ? { type: `image/${M}`; data: Blob }
  : BS extends { type: `audio/${infer M extends string}` }
  ? { type: `audio/${M}`; data: Blob }
  : BS extends { type: `video/${infer M extends string}` }
  ? { type: `video/${M}`; data: Blob }
  : never;
