import {
  TemplatedApp,
  App,
  HttpRequest as UwsHttpRequest,
  HttpResponse as UwsHttpResponse,
} from "uWebSockets.js";
import { Context } from "../context/index";
import {
  Method,
  SchemaContract,
  ContractMetadata as Metadata,
  InputSchemas,
  SuccessResponse,
  ErrorResponse,
} from "../contract/index";
import { WebSocketBehavior } from "./ws";
import { HttpError, HTTP_SERVICE_ERROR_CODES } from "../errors";
import { HttpRequest } from "./request";
import { HttpResponse } from "./response";
import { ServerSettings } from "./settings";
import { validate, resolveResponse } from "./validator";
import { Logger } from "./modules/logger";

type EndpointHandler = {
  contract: SchemaContract<
    Method,
    string,
    InputSchemas<string, Method>,
    SuccessResponse,
    ErrorResponse,
    Metadata
  >;
  handler: (ctx: any) => Promise<any>;
  middlewares: any[];
};

export class Server<Endpoints extends EndpointHandler[] = []> {
  private app: TemplatedApp;
  private settings: ServerSettings;
  private logger: Logger;
  constructor(settings: ServerSettings = {}) {
    this.app = App();
    this.settings = settings;
    this.logger = new Logger(settings.logger || { level: "info" });
  }

  listen(port: number, cb?: () => void | Promise<void>) {
    this.app.listen(port, (listenSocket) => {
      if (listenSocket) {
        this.logger.info(`Listening on port ${port}`);
        if (cb) cb();
      } else {
        this.logger.error(`Failed to listen on port ${port}`);
      }
    });
  }

  ws(pattern: string, behavior: WebSocketBehavior) {
    this.app.ws(pattern, {
      close: (ws, code, message) => {
        if (behavior.close) behavior.close(ws, code, message);
      },
      message: (ws, message) => {
        if (behavior.message) behavior.message(ws, message);
      },
      open: (ws) => {
        if (behavior.open) behavior.open(ws);
      },
    });
    return this;
  }

  private parseParamKeys(pattern: string) {
    const params = pattern.match(/:[\w]+/g);
    return params ? params : [];
  }

  private catch(
    handler: (
      error: any,
      req: HttpRequest,
      res: HttpResponse
    ) => void | Promise<void>
  ): this {
    this.catchFunction = async (err, req, res) => {
      if (!(err instanceof HttpError)) {
        err = new HttpError("ERR_INTERNAL_SERVER_ERROR", 500);
      }

      res.status(err.status);
      handler(err, req, res);
    };
    return this;
  }

  public register<E extends EndpointHandler>(
    endpoint: E
  ): Server<[...Endpoints, E]> {
    const { method, path, docs } = endpoint.contract;
    const paramKeys = this.parseParamKeys(path);

    this.logger.info(
      `Endpoint -  ${method.toUpperCase()} ${path} [${docs?.description}]`
    );

    if (endpoint.middlewares?.length) {
      this.logger.info(
        `  ↳ Middlewares: ${endpoint.middlewares
          .map((mw) => mw.name)
          .join(", ")}`
      );
    }

    this.app[method](
      path,
      async (ures: UwsHttpResponse, ureq: UwsHttpRequest) => {
        const start = process.hrtime();

        const req = new HttpRequest(ureq, ures, path, paramKeys);
        const res = new HttpResponse<any>();

        let aborted = false;
        ures.onAborted(() => (aborted = true));

        const requestId = Math.random().toString(36).slice(2);
        const data: Record<string, any> = {};

        this.logger.info(
          `[${requestId}] → ${req.method.toUpperCase()} ${req.url}`
        );

        this.logger.debug(`[${requestId}] headers:`, req.headers);

        try {
          // Run middlewares
          const { headers, query, url, params } = req;

          for (const mw of endpoint.middlewares) {
            const output = await mw({
              headers,
              query,
              url,
              data,
              params,
            });
            Object.assign(data, output);
          }

          // Validate request inputs
          if (this.settings.validateRequest) {
            const parsedBody = endpoint.contract.body
              ? await req.body()
              : undefined;

            validate(
              endpoint.contract,
              {
                query: req.query,
                params: req.params,
                headers: req.headers,
                body: parsedBody,
              },
              requestId
            );
          }

          const ctx: Context<any, any> = {
            body: req.body.bind(req),
            files: req.files.bind(req),
            params: req.params,
            query: req.query,
            headers: req.headers,
            method: req.method,
            header: res.header.bind(res),
            text: (t) => res.status(200).text(t),
            file: res.file.bind(res),
            status: res.status.bind(res),
            end: res.end.bind(res),
            json: res.json.bind(res),
            binary: res.binary.bind(res),
            send: res.send.bind(res),
            data,
            error: (code) => {
              throw new HttpError(code, HTTP_SERVICE_ERROR_CODES[code] || 500);
            },
          };

          const result = await endpoint.handler(ctx);
          resolveResponse(
            endpoint.contract,
            res,
            result,
            this.settings.validateResponse
          );
        } catch (err) {
          await this.catchFunction?.(err, req, res);
          if (!aborted && !res.body) {
            const finalErr =
              err instanceof HttpError
                ? err
                : new HttpError("ERR_INTERNAL_SERVER_ERROR", 500);
            ures.cork(() => {
              ures.writeStatus(`${finalErr.status} ${finalErr.message}`);
              ures.writeHeader("Content-Type", "application/json");
              ures.end(
                JSON.stringify({
                  code: finalErr.code,
                  message: finalErr.message,
                })
              );
            });
          }
        } finally {
          if (!aborted) {
            const end = process.hrtime(start);
            const ms = (end[0] * 1000 + end[1] / 1e6).toFixed(1);
            this.logger.info(
              `[${requestId}] ← ${res.statusCode || 200} (${ms}ms)`
            );
            this.logger.debug(`[${requestId}] res headers:`, res.headers);

            ures.cork(() => {
              if (res.statusCode) ures.writeStatus(res.statusCode);
              if (res.hasHeaders) {
                for (const [h, v] of Object.entries(res.headers)) {
                  ures.writeHeader(h, v);
                }
              }
              ures.end(res.body);
            });
          }
        }
      }
    );

    return this as any;
  }
}
