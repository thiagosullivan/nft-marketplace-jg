import { ws } from "msw";
import { toSocketIo } from "@mswjs/socket.io-binding";

const activeConnections = new Set<{
  emit: (event: string, payload: unknown) => void;
}>();

export const SOCKET_PATH = "/socket.io/";

const socketLink = ws.link(`ws://localhost:5173${SOCKET_PATH}`);

export const socketHandlers = [
  socketLink.addEventListener("connection", (connection) => {
    const io = toSocketIo(connection);

    const connectionWrapper = {
      emit: (event: string, payload: unknown) => {
        io.client.emit(event, payload);
      },
    };
    activeConnections.add(connectionWrapper);

    connection.client.addEventListener("close", () => {
      activeConnections.delete(connectionWrapper);
    });

    if (import.meta.env.DEV) {
      console.info("[MSW] Socket.IO client connected");
    }
  }),
];

export function emitToAll(event: string, payload: unknown): void {
  for (const connection of activeConnections) {
    connection.emit(event, payload);
  }
}

export function activeConnectionCount(): number {
  return activeConnections.size;
}
