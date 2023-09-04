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
}
