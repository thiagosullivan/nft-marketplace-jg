import { WebSocketInterceptor } from "@mswjs/interceptors/WebSocket";
import { toSocketIo } from "@mswjs/socket.io-binding";

type ActiveConnection = {
  emit: (event: string, payload: unknown) => void;
  close: () => void;
};

const activeConnections = new Set<ActiveConnection>();

const interceptor = new WebSocketInterceptor();

interceptor.on("connection", (connection) => {
  const io = toSocketIo(connection as never);

  const wrapper: ActiveConnection = {
    emit: (event, payload) => {
      io.client.emit(event, payload);
    },
    close: () => {
      try {
        connection.client.close(1000, "mock-disconnect");
      } catch {
        /* noop */
      }
    },
  };
  activeConnections.add(wrapper);

  connection.client.addEventListener("close", () => {
    activeConnections.delete(wrapper);
  });

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

export function disconnectAllConnections(): number {
  const count = activeConnections.size;
  for (const connection of activeConnections) {
    connection.close();
  }
  activeConnections.clear();
  return count;
}

export function activeConnectionCount(): number {
  return activeConnections.size;
}
