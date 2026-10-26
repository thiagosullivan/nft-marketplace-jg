import type { Socket } from "socket.io-client";

type ConnectOptions = {
  token: string;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
};

/**
 * Cria e conecta o socket.io-client. O import de `socket.io-client` é
 * DINÂMICO e só roda depois do `worker.start()` (disparado pelo evento
 * `msw:ready`), porque o Socket.IO guarda a referência do
 * `globalThis.WebSocket` no import e o MSW precisa ter sobrescrito
 * antes.
 */
export async function connectSocket(options: ConnectOptions): Promise<Socket> {
  const { io } = await import("socket.io-client");

  const socket = io({
    transports: ["websocket"],
    autoConnect: false,
    auth: { token: options.token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 5_000,
  });

  socket.on("connect", () => {
    options.onConnect?.();
  });

  socket.on("disconnect", (reason) => {
    options.onDisconnect?.(reason);
  });

  socket.on("connect_error", (error) => {
    console.warn("[socket] connect_error", error.message);
    options.onError?.(error);
  });

  socket.connect();
  return socket;
}
