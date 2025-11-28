import { OAuthFlowObject, SecuritySchemeObject } from "openapi3-ts/oas31";

export function bearerAuthScheme(description?: string): SecuritySchemeObject {
  return {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description,
  };
}

export function basicAuthScheme(description?: string): SecuritySchemeObject {
  return {
    type: "http",
    scheme: "basic",
    description,
  };
}

export function apiKeyAuthScheme(
  options: Omit<SecuritySchemeObject, "type" | "description">,
  description?: string
): SecuritySchemeObject {
  return {
    type: "apiKey",
    description,
    ...options,
  };
}

export function oauth2Scheme(
  flows: OAuthFlowObject,
  description?: string
): SecuritySchemeObject {
  return {
    type: "oauth2",
    description,
    flows,
  };
}
