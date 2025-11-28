interface WebSocket {
  send(message: string): void;
}

export interface WebSocketBehavior {
  close?: (ws: WebSocket, code: number, message: ArrayBuffer) => void;
  message?: (ws: WebSocket, message: ArrayBuffer) => void;
  open?: (ws: WebSocket) => void;
}
