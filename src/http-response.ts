import { readFile } from 'fs/promises';
import { HttpResponse as UHttpResponse } from 'uWebSockets.js';
import { getMime } from './mime';

export class HttpResponse {
  private res: UHttpResponse;
  
  constructor(res: UHttpResponse) {
    this.res = res;
  }

  /**
   * Sets response headers
   * 
   * @param key Header key
   * @param value Header value
   * @returns HttpResponse instance
   * 
   * @example
   * ```
   * app.get('/user', (req, res) => {
   *  res.header('X-HEADER-ID', '123').json({ success: true });
   * });
   * ```
   */
  header(key: string, value: string) {
    this.res.writeHeader(key, value);

    return this;
  }

  /**
   * Responses JSON
   * 
   * @param json Object to serialize and response
   * 
   * @example
   * ```
   * app.get('/user', (req, res) => res.json({ success: true }));
   * ```
   */
  json(json: any) {
    this.send(JSON.stringify(json));
  }

  /**
   * Responses text
   * 
   * @param text Text to response
   * 
   * @example
   * ```
   * app.get('/user', (req, res) => res.send('success'));
   * ```
   */
  send(text: string) {
    this.res.end(text);
  }

  /**
   * Responses file
   * 
   * @param path File path
   * 
   * @example
   * ```
   * app.get('/user', (req, res) => res.sendFile('./uploads/profile.png'));
   * ```
   */
  async sendFile(path: string) {
    try {
      const file = await readFile(path);

      this
      .header('Content-Type', getMime(path as string))
      .send(file as any);
    } catch (e) {
      this.status(404).send('Not found');
    }
  }

  /**
   * Response status
   * 
   * @param status Status code
   * @returns HttpResponse instance
   * 
   * @example
   * ```
   * app.post('/user', (req, res) => res.status(201).json({ success: true }));
   * ```
   */
  status(status: number) {
    this.res.writeStatus(status.toString());

    return this;
  }
}
