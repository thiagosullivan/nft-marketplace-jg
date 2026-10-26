import { WebSocketInterceptor } from "@mswjs/interceptors/WebSocket";
import { toSocketIo } from "@mswjs/socket.io-binding";

const activeConnections = new Set<{
  emit: (event: string, payload: unknown) => void;
}>();

const interceptor = new WebSocketInterceptor();

interceptor.on("connection", (connection) => {
  // O toSocketIo espera WebSocketHandlerConnection (tipo do ws.link do MSW),
  // mas o interceptor direto emite WebSocketConnectionData (sem params).
  // O runtime funciona; o cast silencia o TS.
  const io = toSocketIo(connection as never);

  const wrapper = {
    emit: (event: string, payload: unknown) => {
      io.client.emit(event, payload);
    },
  };
  activeConnections.add(wrapper);

  if (import.meta.env.DEV) {
    console.info("[MSW] Socket.IO client connected");
  }
});

export function applySocketInterceptor(): void {
  interceptor.apply();
}

export function emitToAll(event: string, payload: unknown): void {
  for (const connection of activeConnections) {
    connection.emit(event, payload);
  }
}
