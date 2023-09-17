import { HttpRequest as UHttpRequest } from 'uWebSockets.js';
import { parseQuery } from './utils';

export interface UploadedFile {
  data: ArrayBuffer;
  filename: string;
  type: string;
}

export class HttpRequest {
  /**
   * Request body content
   */
  body: { [key: string]: any } = {};

  /**
   * Request user defined data
   */
  data: { [key: string]: any } = {};

  /**
   * Request body content
   */
  files: { [key: string]: UploadedFile | undefined } = {};

  /**
   * Request headers
   */
  headers: { [key: string]: string } = {};

  /**
   * Request path params
   */
  params: { [key: string]: string } = {};

  /**
   * Request query params
   */
  query: any = {};

  /**
   * Request query params and body content
   */
  inputs: { [key: string]: any } = {};

  /**
   * Request URL including initial /slash
   */
  url: string;

  private pattern: string;
  private req: UHttpRequest;

  constructor(req: UHttpRequest, pattern: string) {
    this.req = req;
    this.pattern = pattern;
    this.url = req.getUrl();

    this.getHeaders();
    this.getParams();
    this.getQuery();
    this.getInputs();
  }

  private getHeaders() {
    this.req.forEach((key, value) => this.headers[key] = value);
  }

  private getParams() {
    const params = this.pattern.match(/:[\w]+/g);

    if (!params) return;

    for (let i = 0; i < params.length; i++) this.params[params[i].replace(':', '')] = this.req.getParameter(i);
  }

  private getQuery() {
    const query = this.req.getQuery();

    if (query) this.query = parseQuery(query);
  }

  private getInputs() {
    this.inputs = { ...this.query, ...this.body };
  }

  public post(key: string, defaultValue?: any) {
    return this.body[key] ?? defaultValue ?? null;
  }

  public all() {
    this.getInputs();
    return this.inputs;
  }
  
  public get(key: string, defaultValue?: any) {
    return this.inputs[key] ?? defaultValue ?? null;
  }

  public has(key: string) {
    return this.inputs[key] !== undefined;
  }

  public header(key: string, defaultValue?: string) {
    return this.headers[key] ?? defaultValue ?? null;
  }
  
  public param(key: string, defaultValue?: string) {
    return this.params[key] ?? defaultValue ?? null;
  }

  public queryParam(key: string, defaultValue?: string) {
    return this.query[key] ?? defaultValue ?? null;
  }

  public file(key: string) {
    return this.files[key] ?? null;
  }
}
