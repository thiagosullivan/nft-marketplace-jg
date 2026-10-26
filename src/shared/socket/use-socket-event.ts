import { useEffect, useRef } from "react";
import { useSocketContext } from "./socket-provider";

type SocketEvent<T> = {
  id: string;
  version: number;
  payload: T;
};

/**
 * Assina um evento Socket.IO, tolerando duplicatas e eventos antigos.
 *
 * Deduplica por `id` (identidade estável do recurso) + `version`.
 * Se chegar um `version` <= ao último visto para o mesmo `id`, ignora
 * (evento antigo ou duplicata) [enunciado §7].
 */
export function useSocketEvent<T>(
  event: string,
  handler: (payload: T) => void,
): void {
  const { socket } = useSocketContext();
  const handlerRef = useRef(handler);
  const seenRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket) return;

    const listener = (data: SocketEvent<T>) => {
      if (!data || typeof data !== "object") return;

      const { id, version, payload } = data;
      if (!id || typeof version !== "number") return;

      const lastSeen = seenRef.current.get(id);
      if (lastSeen !== undefined && version <= lastSeen) {
        // Evento antigo ou duplicata: ignora.
        return;
      }
      seenRef.current.set(id, version);
      handlerRef.current(payload);
    };

    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [socket, event]);
}
