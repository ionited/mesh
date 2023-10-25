# Fiber

> A fast web framework based on uWebSocket.js

## About uWebSockets.js

µWebSockets.js is a web server bypass for Node.js that reimplements eventing, networking, encryption, web protocols, routing and pub/sub in highly optimized C++. As such, µWebSockets.js delivers web serving for Node.js, **[8.5x that of Fastify](https://alexhultman.medium.com/serving-100k-requests-second-from-a-fanless-raspberry-pi-4-over-ethernet-fdd2c2e05a1e)** and at least **[10x that of Socket.IO](https://medium.com/swlh/100k-secure-websockets-with-raspberry-pi-4-1ba5d2127a23)**. It is also the built-in **[web server of Bun](https://bun.sh/)**.

## Quick start

### Install with NPM

```
npm i @ionited/fiber
```

---

## Documentation

### App

```ts
const app = new App();

app

.use((req, res) => console.log('Hello World!'))

.catch((e, req, res) => res.status(e.status ?? 500).json({ message: e.message ?? 'Internal server error' }))

.notFound((req, res) => res.status(404).end())

.any('/users', (req, res) => res.json({ success: true }))

.del('/users', (req, res) => res.json({ success: true }))

.get('/users', (req, res) => res.json({ success: true }))

.options('/users', (req, res) => res.json({ success: true }))

.post('/users', (req, res) => res.json({ success: true }))

.put('/users', (req, res) => res.json({ success: true }))

.ws('/ws', {
  close: (ws, code, message) => {},
  message: (ws, message) => {},
  open: ws => {}
})

.listen(1000);
```

### Router

```ts
const router = new Router('/public')

router

.use((req, res) => console.log('Hello World!'))

.any('/users', (req, res) => res.json({ success: true }))

.del('/users', (req, res) => res.json({ success: true }))

.get('/users', (req, res) => res.json({ success: true }))

.options('/users', (req, res) => res.json({ success: true }))

.post('/users', (req, res) => res.json({ success: true }))

.put('/users', (req, res) => res.json({ success: true }))

.ws('/ws', {
  close: (ws, code, message) => {},
  message: (ws, message) => {},
  open: ws => {}
});

const routes = router.routes();
```

### HttpRequest

```ts
interface HttpRequest {
  body(): Promise<{ [key: string]: any }>;
  data: { [key: string]: any };
  files(): Promise<{ [key: string]: UploadedFile | undefined }>;
  headers(): { [key: string]: string };
  params(): { [key: string]: string };
  query(): { [key: string]: any };
  url(): string;
}
```

### HttpResponse

```ts
interface HttpResponse {
  end(text?: string): void;
  header(key: string, value: string): this;
  json(json: any): void;
  send(text: string): void;
  sendFile(path: string): Promise<void>;
  status(status: number): this;
}
```

### UploadedFile

```ts
interface UploadedFile {
  data: ArrayBuffer;
  filename: string;
  type: string;
}
```

### WebSocket

```ts
interface WebSocket {
  send(message: string): void;
}
```

### WebSocketBehavior

```ts
export interface WebSocketBehavior {
  close?: (ws: WebSocket, code: number, message: ArrayBuffer) => void;
  message?: (ws: WebSocket, message: ArrayBuffer) => void;
  open?: (ws: WebSocket) => void;
}
```

## License

Copyright (c) 2023 Ion. Licensed under [MIT License](LICENSE).

[https://ionited.io](https://ionited.io)
