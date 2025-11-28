import { readFile } from "fs/promises";
import { getMime } from "./mime";
import { HTTP_SERVICE_ERROR_CODES, HttpErrorCode, HttpStatus } from "../errors";
import { BodySchema, bodyType } from "../endpoint/output";  

export class HttpResponse<T = any> {
  /**
   * Response body or raw text
   */
  public body?: T | string | Buffer;

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
   * Responses JSON with proper content-type header
   *
   * @param json Object to serialize and response
   *
   * @example
   * ```
   * app.get('/users', (req, res) => res.json({ success: true }));
   * ```
   */
  json(data: T) {
    this.header('content-type', 'application/json');
    this.text(JSON.stringify(data));
  }

  /**
   * Responses text with proper content-type header
   *
   * @param text Text to response
   *
   * @example
   * ```
   * app.get('/users', (req, res) => res.text('success'));
   * ```
   */
  text(text: string) {
    if (!this.headers['content-type']) {
      this.header('content-type', 'text/plain');
    }
    this.body = text;
  }

  /**
   * Send binary data with proper content-type
   *
   * @param data Buffer data to send
   * @param contentType Optional content type (defaults to application/octet-stream)
   *
   * @example
   * ```
   * app.get('/download', (req, res) => res.binary(buffer, 'image/png'));
   * ```
   */
  binary(data: Buffer, contentType: string = 'application/octet-stream') {
    this.header('content-type', contentType);
    this.body = data;
    return this;
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
  async file(path: string) {
    try {
      const file = await readFile(path);

      this.header("Content-Type", getMime(path)).text(file.toString());
    } catch (e) {
      this.status(404).text("Not found");
    }
  }

  /**
   * Build response according to BodySchema pattern
   *
   * @param schema BodySchema defining the response format
   * @param data Data to send according to the schema
   * @param logger Optional logger for validation errors
   * @param validateResponse Optional flag to enable/disable response validation
   *
   * @example
   * ```
   * const schema = { type: 'application/json', schema: userSchema };
   * res.buildResponse(schema, userData, logger, true);
   * ```
   */
  buildResponse<S extends BodySchema>(
    schema: S,
    data: bodyType<S>['data'],
    validateResponse?: boolean
  ) {
    let dataToRespond = data;

    // Check if schema has a nested schema property and if validation is enabled
    if ('schema' in schema && schema.schema && validateResponse) {
      const validationSchema = schema.schema;
      const validation = validationSchema.safeParse(data);
      if (!validation.success) {
        // logFn.error(
        //   `Server-side response validation failed for ${schema.type}. Data does not match schema.`,
        //   { issues: validation.error.issues, dataProvided: data }
        // );

        this.status(500).error("ERR_VALIDATION_PARAMS");
        return;
      }
      dataToRespond = validation.data; // Use validated data
    }

    switch (schema.type) {
      case 'application/json':
        return this.json(dataToRespond); // dataToRespond is already validated if applicable

      case 'text/plain':
        return this.text(String(dataToRespond)); // dataToRespond is already validated if applicable

      case 'application/octet-stream':
        return this.binary(dataToRespond as Buffer); // dataToRespond is already validated if applicable

      case 'multipart/form-data':
        this.header('content-type', 'multipart/form-data');
        // For multipart/form-data, the body is typically a string representation or a Buffer.
        // The actual formatting to multipart would be complex and is often handled by libraries.
        // Here, we assume dataToRespond is already in a suitable format (e.g., string or Buffer).
        this.body = dataToRespond as string | Buffer;
        return this;

      case 'text/event-stream':
        this.header('content-type', 'text/event-stream');
        this.body = dataToRespond as string;
        return this;

      case 'application/x-www-form-urlencoded':
        this.header('content-type', 'application/x-www-form-urlencoded');
        this.body = dataToRespond as string;
        return this;

      default:
        const currentType = schema.type as string;
        if (
          currentType.startsWith('image/') ||
          currentType.startsWith('audio/') ||
          currentType.startsWith('video/')
        ) {
          // Media types are typically binary
          return this.binary(dataToRespond as Buffer, currentType);
        }
        return this.text(String(dataToRespond));
    }
  }

  /**
   * Send response with automatic content-type detection
   *
   * @param data Data to send (auto-detects type)
   *
   * @example
   * ```
   * res.send({ user: 'john' }); // JSON
   * res.send('Hello world');    // Text
   * res.send(buffer);          // Binary
   * ```
   */
  send(data: string | Buffer | T) {
    if (typeof data === 'string') {
      return this.text(data);
    } else if (Buffer.isBuffer(data)) {
      return this.binary(data);
    } else if (typeof data === 'object' && data !== null) {
      return this.json(data);
    } else {
      return this.text(String(data));
    }
  }

  /**
   * Responses error
   *
   * @param code Error status code
   * @param details Optional additional error details
   *
   * @example
   * ```
   * app.get('/users', (req, res) => res.sendError('ERROR_INVALID_REQUEST'));
   * ```
   */
  error(code: HttpErrorCode) {
    const status = HTTP_SERVICE_ERROR_CODES[code];
    this.status(status).error(code);
    return this
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
  status(status: HttpStatus) {
    this.statusCode = String(status);
    return this;
  }
}
