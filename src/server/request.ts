import {
  HttpRequest as UHttpRequest,
  HttpResponse as UHttpResponse,
  getParts,
} from "uWebSockets.js";
import { parseQuery } from "../utils";
import { Method } from "../contract/index";
import { ContentType, contentTypes } from "../types";

export interface UploadedFile {
  data: ArrayBuffer;
  filename: string;
  type: string;
}

export class HttpRequest<TBody = any, TQuery = any, TParams = any, THeaders = any> {
  /**
   * Route pattern
   */
  route: string;

  private bodyData: Buffer | null = null;
  private contentType = "";
  private paramKeys: string[];
  private req: UHttpRequest;
  private res: UHttpResponse;

  constructor(
    req: UHttpRequest,
    res: UHttpResponse,
    pattern: string,
    paramKeys: string[]
  ) {
    this.req = req;
    this.res = res;
    this.route = pattern;
    this.paramKeys = paramKeys;
  }

  /**
   * Request body content
   */
  async body(): Promise<TBody> {
    this.contentType =
      this.contentType || this.req.getHeader("content-type") || "";

    if (!this.contentType) return {} as TBody;

    const rawBody = this.bodyData || (await this.getBody(this.res));
    this.bodyData = rawBody;

    if (!rawBody?.length) return {} as TBody;

    // Use the BodySchema pattern from output.ts
    return this.parseBodyByContentType(this.contentType, rawBody) as TBody;
  }

  /**
   * Get the ContentType from request headers
   */
  get requestContentType(): ContentType | null {
    const contentType = this.req.getHeader("content-type");
    if (!contentType) return null;
    
    const baseContentType = contentType.split(";")[0].trim();
    return this.mapContentTypeToEnum(baseContentType);
  }

  /**
   * Validate request content-type against expected type
   */
  validateContentType(expectedType: ContentType): boolean {
    const actualType = this.requestContentType;
    return actualType === expectedType;
  }

  /**
   * Get raw body buffer (useful for binary data)
   */
  async rawBody(): Promise<Buffer | null> {
    if (this.bodyData) return this.bodyData;
    
    try {
      this.bodyData = await this.getBody(this.res);
      return this.bodyData;
    } catch (error) {
      return null;
    }
  }

  /**
   * Request body content
   */
  async files(): Promise<{ [key: string]: UploadedFile | undefined }> {
    this.contentType = this.contentType
      ? this.contentType
      : this.req.getHeader("content-type");

    if (!this.contentType) return {};

    const body = this.bodyData ? this.bodyData : await this.getBody(this.res);

    this.bodyData = body;

    if (!body?.length) return {};

    if (this.contentType.startsWith("multipart/form-data")) {
      const data: any = {};

      getParts(body, this.contentType)?.forEach((p) => {
        if (p.type && p.filename) {
          const name = p.name.slice(-2) === "[]" ? p.name.slice(0, -2) : p.name,
            value = { data: p.data, filename: p.filename, type: p.type };

          if (data[name] === undefined)
            data[name] = p.name.slice(-2) === "[]" ? [value] : value;
          else if (Array.isArray(data[name])) data[name].push(value);
          else data[name] = [data[name], value];
        }
      });

      return data;
    } else return {};
  }

  /**
   * Request headers
   */
  get headers(): THeaders {
    const headers: Record<string, unknown> = {};

    this.req.forEach((key, value) => (headers[key] = value));

    return headers as THeaders;
  }

  /**
   * Lowercased HTTP method
   */
  get method(): Method {
    return this.req.getMethod() as Method;
  }

  /**
   * Request path params
   */
  get params(): TParams {
    const data: any = {};

    for (let i = 0; i < this.paramKeys.length; i++)
      data[this.paramKeys[i].slice(1)] = this.req.getParameter(i);

    return data as TParams;
  }

  /**
   * Request query params
   */
  get query(): TQuery {
    const query = this.req.getQuery();

    if (query) return parseQuery(query) as TQuery;

    return {} as TQuery;
  }

  /**
   * Request URL including initial /slash
   */
  get url() {
    return this.req.getUrl();
  }

  private async getBody(res: UHttpResponse): Promise<Buffer> {
    let buffer: Buffer;

    return new Promise((resolve) =>
      res.onData((ab, isLast) => {
        const chunk = Buffer.from(ab);

        if (isLast) {
          if (buffer) resolve(Buffer.concat([buffer, chunk]));
          else resolve(chunk);
        } else {
          if (buffer) buffer = Buffer.concat([buffer, chunk]);
          else buffer = Buffer.concat([chunk]);
        }
      })
    );
  }

  private parseBodyByContentType(contentType: string, rawBody: Buffer): any {
    // Clean content type (remove charset, boundary, etc.)
    const baseContentType = contentType.split(";")[0].trim();
    
    // Map actual content-type to our ContentType system
    const mappedType = this.mapContentTypeToEnum(baseContentType);

    switch (mappedType) {
      case "json":
        try {
          return JSON.parse(rawBody.toString());
        } catch (error) {
          throw new Error(`Invalid JSON body: ${error}`);
        }

      case "form":
        return parseQuery(rawBody.toString());

      case "upload":
        return this.parseMultipartFormData(rawBody, contentType);

      case "binary":
        return rawBody;

      case "stream":
        // For server-sent events or streaming data
        return {
          type: "stream",
          data: rawBody.toString(),
          contentType: baseContentType,
        };

      default:
        // Handle other content types
        if (baseContentType.startsWith("text/")) {
          return {
            type: "text",
            data: rawBody.toString(),
            contentType: baseContentType,
          };
        } else if (
          baseContentType.startsWith("image/") ||
          baseContentType.startsWith("audio/") ||
          baseContentType.startsWith("video/")
        ) {
          return {
            type: "media",
            data: rawBody,
            contentType: baseContentType,
          };
        }

        // Default: return raw buffer for unknown types
        return {
          type: "unknown",
          data: rawBody,
          contentType: baseContentType,
        };
    }
  }

  /**
   * Maps actual HTTP content-type headers to our ContentType enum
   */
  private mapContentTypeToEnum(contentType: string): ContentType | null {
    // Find matching ContentType by comparing with contentTypes values
    for (const [key, value] of Object.entries(contentTypes)) {
      if (value === contentType) {
        return key as ContentType;
      }
    }
    return null;
  }

  private parseMultipartFormData(rawBody: Buffer, contentType: string): any {
    const data: any = {};

    getParts(rawBody, contentType)?.forEach((part) => {
      if (!part.type && !part.filename) {
        // Regular form field
        data[part.name] = Buffer.from(part.data).toString();
      }
      // Files are handled separately by files() method
    });

    return data;
  }
}
