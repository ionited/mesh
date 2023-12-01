import { readFile } from 'fs/promises';
import { getMime } from './mime';
import { STATUS_CODES } from 'http';

export class HttpResponse {
  /**
   * Response body
   */
  body? = '';

  hasHeaders = false;

  /**
   * Response headers
   */
  headers: { [key: string]: string } = {};

  /**
   * Response status
   */
  statusCode?: string;

  /**
   * Ends response
   * 
   * @param text Text to response
   * 
   * @example
   * ```
   * app.get('/users', (req, res) => res.end());
   * ```
   */
  end(text?: string) {
    this.body = text;
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
   * app.get('/users', (req, res) => {
   *  res.header('X-HEADER-ID', '123').json({ success: true });
   * });
   * ```
   */
  header(key: string, value: string) {
    this.headers[key] = value;

    this.hasHeaders = true;

    return this;
  }

  /**
   * Responses JSON
   * 
   * @param json Object to serialize and response
   * 
   * @example
   * ```
   * app.get('/users', (req, res) => res.json({ success: true }));
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
   * app.get('/users', (req, res) => res.send('success'));
   * ```
   */
  send(text: string) {
    this.body = text;
  }

  /**
   * Responses file
   * 
   * @param path File path
   * 
   * @example
   * ```
   * app.get('/users', (req, res) => res.sendFile('./uploads/profile.png'));
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
   * app.post('/users', (req, res) => res.status(201).json({ success: true }));
   * ```
   */
  status(status: number) {
    this.statusCode = this.getStatusCode(status);

    return this;
  }

  private getStatusCode(status: number) {
    return `${status} ${STATUS_CODES[status]}`;
  }
}
