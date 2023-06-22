# Fiber

> A fast web framework based on uWebSocket.js

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

.del('/user', (req, res) => res.json({ success: true }))

.get('/user', (req, res) => res.json({ success: true }))

.post('/user', (req, res) => res.json({ success: true }))

.put('/user', (req, res) => res.json({ success: true }))

.listen(1000);
```

### Router

```ts
const router = new Router('/public')

router

.use((req, res) => console.log('Hello World!'))

.del('/users', (req, res) => res.json({ success: true }))

.get('/users', (req, res) => res.json({ success: true }))

.post('/users', (req, res) => res.json({ success: true }))

.put('/users', (req, res) => res.json({ success: true }));

const routes = router.routes();
```

# HttpRequest

```ts
interface HttpRequest {
  body: { [key: string]: any };
  data: { [key: string]: any };
  files: { [key: string]: UploadedFile | undefined } = {};
  headers: { [key: string]: string };
  params: { [key: string]: string };
  query: { [key: string]: string };
  url: string;
}
```

# HttpResponse

```ts
interface HttpResponse {
  header(key: string, value: string): this;
  json(json: any): void;
  send(text: string): void;
  sendFile(path: string): Promise<void>;
  status(status: number): this;
}
```

## License

Copyright (c) 2023 Ion. Licensed under [MIT License](LICENSE).
