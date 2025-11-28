import {
  ParameterLocation,
  ParameterObject,
  SchemaObject,
} from "openapi3-ts/oas31";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ZodObject } from "zod";
import { ZodShape } from "../contract";

// export function generateOpenApiSpecFromEndpoints(
//   endpoints: Array<ReturnType<typeof endpoint>>
// ): OpenAPIV3.Document {
//   const paths: Record<string, OpenAPIV3.PathItemObject> = {};

//   for (const endpoint of endpoints) {
//     const { method, path, body, params, query, responses, docs } = endpoint.contract;

//     const fullPath = path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');

//     const operation: OpenAPIV3.OperationObject = {
//       operationId: docs?.operationId ?? `${method}_${fullPath}`,
//       summary: docs?.summary,
//       description: docs?.description,
//       tags: docs?.tags ?? [],
//       parameters: [],
//       responses: buildResponses(responses),
//     };

//     if (params) {
//       for (const [key, schema] of Object.entries(params.shape)) {
//         operation.parameters!.push({
//           name: key,
//           in: 'path',
//           required: true,
//           schema: zodToJsonSchema(schema) as OpenAPIV3.SchemaObject,
//         });
//       }
//     }

//     if (query) {
//       for (const [key, schema] of Object.entries(query.shape)) {
//         operation.parameters!.push({
//           name: key,
//           in: 'query',
//           required: false,
//           schema: zodToJsonSchema(schema) as OpenAPIV3.SchemaObject,
//         });
//       }
//     }

//     if (body) {
//       operation.requestBody = {
//         required: true,
//         content: {
//           'application/json': {
//             schema: zodToJsonSchema(body) as OpenAPIV3.SchemaObject,
//           },
//         },
//       };
//     }

//     paths[fullPath] ??= {};
//     (paths[fullPath] as any)[method] = operation;
//   }

//   return {
//     openapi: '3.0.0',
//     info: {
//       title: 'My API',
//       version: '1.0.0',
//     },
//     paths,
//   };
// }

// function buildResponses(
//   responses: SchemaContract<any, any, any, any, any>['responses']
// ): OpenAPIV3.ResponsesObject {
//   const result: OpenAPIV3.ResponsesObject = {};

//   for (const [statusCode, schema] of Object.entries(responses)) {
//     result[statusCode] = {
//       description: `HTTP ${statusCode}`,
//       content: {
//         'application/json': {
//           schema: zodToJsonSchema(schema) as OpenAPIV3.SchemaObject,
//         },
//       },
//     };
//   }

//   return result;
// }
// src/utils/generateOpenApiWithRefs.ts

// src/utils/generateOpenApiWithRefs.ts

// export function createOpenApiSpec(contracts: Contract<any, any, any, any, any>[]): object {
//   return {
//     openapi: '3.0.0',
//     info: {
//       title: 'API Documentation',
//       version: '1.0.0',
//     },
//     paths: contracts
//       .filter(contract => contract.public)
//       .reduce((paths, contract) => ({
//         ...paths,
//         [contract.path]: {
//           [contract.method.toLowerCase()]: {
//             tags: contract.tags,
//             description: contract.description,
//             deprecated: contract.deprecated,
//             security: contract.auth.map(auth => ({
//               [auth.type]: [],
//             })),
//             parameters: [], // TODO: Convert input params/query to OpenAPI format
//             requestBody: {}, // TODO: Convert input body to OpenAPI format
//             responses: {}, // TODO: Convert output responses to OpenAPI format
//           },
//         },
//       }), {}),
//     components: {
//       securitySchemes: {}, // TODO: Convert auth methods to OpenAPI format
//       schemas: {}, // TODO: Convert TypeBox schemas to OpenAPI format
//     },
//   };
// }

export const zodSchemaToOpenApiParams = <T extends ZodShape>(
  _in: ParameterLocation,
  schema: ZodObject<T>
) => {
  if (!schema) return [];

  const params: ParameterObject[] = [];

  const keys = Object.keys(schema.keyof().Values);

  for (const key of keys) {
    params.push({
      in: _in,
      name: key,
      schema: zodToJsonSchema(schema.shape[key]) as SchemaObject,
      required: !schema.shape[key].isOptional(),
    });
  }

  return params;
};
