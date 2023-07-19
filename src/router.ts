import { HttpResponse } from './http-response';
import { HttpRequest } from './http-request';
import { WebSocketBehavior } from './ws';

export interface Route {
  method: 'any' | 'del' |  'get' | 'options' | 'post' | 'put' | 'use' | 'ws';
  pattern?: string;
  handler?: (req: HttpRequest, res: HttpResponse) => void | Promise<void>;
  behavior?: WebSocketBehavior;
}

export class Router {
  private prefix = '';
  private data: Route[] = [];

  /**
   * Creates a router
   * 
   * @param prefix path prefix
   * 
   * @example
   * ```
   * const router = new Router('/user');
   * ```
   */
  constructor(prefix?: string) {
    this.prefix = prefix ?? '';
  }
  
  /**
   * Registers `ANY` route
   * 
   * @param pattern path to match
   * @param handler request handler function
   * @returns Router instance
   * 
   * @example
   * ```ts
   * const router = new Router();
   * 
   * router.any('/users', (req, res) => res.json({ success: true }));
   * ```
   */
  any(pattern: string, handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>) {
    this.data.push({ method: 'any', pattern: this.prefix + pattern, handler });

    return this;
  }
  
  /**
   * Registers `DELETE` route
   * 
   * @param pattern path to match
   * @param handler request handler function
   * @returns Router instance
   * 
   * @example
   * ```ts
   * const router = new Router();
   * 
   * router.del('/users', (req, res) => res.json({ success: true }));
   * ```
   */
  del(pattern: string, handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>) {
    this.data.push({ method: 'del', pattern: this.prefix + pattern, handler });

    return this;
  }

  /**
   * Registers `GET` route
   * 
   * @param pattern path to match
   * @param handler request handler function
   * @returns Router instance
   * 
   * @example
   * ```ts
   * const router = new Router();
   * 
   * router.get('/users', (req, res) => res.json({ success: true }));
   * ```
   */
  get(pattern: string, handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>) {
    this.data.push({ method: 'get', pattern: this.prefix + pattern, handler });

    return this;
  }

  /**
   * Registers `OPTIONS` route
   * 
   * @param pattern path to match
   * @param handler request handler function
   * @returns Router instance
   * 
   * @example
   * ```ts
   * const router = new Router();
   * 
   * router.options('/users', (req, res) => res.json({ success: true }));
   * ```
   */
  options(pattern: string, handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>) {
    this.data.push({ method: 'options', pattern: this.prefix + pattern, handler });

    return this;
  }

  /**
   * Registers `POST` route
   * 
   * @param pattern path to match
   * @param handler request handler function
   * @returns Router instance
   * 
   * @example
   * ```ts
   * const router = new Router();
   * 
   * router.post('/users', (req, res) => res.json({ success: true }));
   * ```
   */
  post(pattern: string, handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>) {
    this.data.push({ method: 'post', pattern: this.prefix + pattern, handler });

    return this;
  }

  /**
   * Registers `PUT` route
   * 
   * @param pattern path to match
   * @param handler request handler function
   * @returns Router instance
   * 
   * @example
   * ```ts
   * const router = new Router();
   * 
   * router.put('/users', (req, res) => res.json({ success: true }));
   * ```
   */
  put(pattern: string, handler: (req: HttpRequest, res: HttpResponse) => void | Promise<void>) {
    this.data.push({ method: 'put', pattern: this.prefix + pattern, handler });

    return this;
  }

  /**
   * Return registred routes
   * 
   * @returns Router routes
   */
  routes() {
    return this.data;
  }

  /**
   * Registers a middleware
   * 
   * @param middleware executes on requests
   * @returns Router instance
   * 
   * @example
   * ```ts
   * const router = new Router();
   * 
   * router.use((req, res) => console.log('Hello World!'));
   * ```
   */
  use(middleware: (req: HttpRequest, res: HttpResponse) => void | Promise<void>): this;

  /**
   * Registers a middleware
   * 
   * @param pattern path to match
   * @param middleware executes on requests
   * @returns Router instance
   * 
   * @example
   * ```ts
   * const router = new Router();
   * 
   * router.use('/users', (req, res) => console.log('Hello World!'));
   * ```
   */
  use(pattern: string, middleware: (req: HttpRequest, res: HttpResponse) => void | Promise<void>): this;
  use(arg1: string | ((req: HttpRequest, res: HttpResponse) => void | Promise<void>), arg2?: (req: HttpRequest, res: HttpResponse) => void | Promise<void>) {
    this.data.push(typeof arg1 === 'string' ? {
      method: 'use',
      handler: arg2 as (req: HttpRequest, res: HttpResponse) => void | Promise<void>,
      pattern: this.prefix + arg1
    } : { method: 'use', handler: arg1 });

    return this;
  }

  /**
   * Registers WebSockets route
   * 
   * @param pattern path to match
   * @param behavior WebSockets behavior
   * @returns Router instance
   * 
   * @example
   * ```ts
   * const router = new Router();
   * 
   * router.ws('/ws', { message: () => { } });
   * ```
   */
  ws(pattern: string, behavior: WebSocketBehavior) {
    this.data.push({ method: 'ws', pattern: this.prefix + pattern, behavior });

    return this;
  }
}
