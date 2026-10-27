import { useEffect, useRef } from "react";
import { useSocketContext } from "./socket-context";

export type SocketEventEnvelope<T> = {
  id: string;
  version: number;
  payload: T;
};

export function useSocketEvent<T>(
  event: string,
  handler: (envelope: SocketEventEnvelope<T>) => void,
): void {
  const { socket } = useSocketContext();
  const handlerRef = useRef(handler);
  const seenRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket) return;

    const listener = (data: SocketEventEnvelope<T>) => {
      if (!data || typeof data !== "object") return;
      const { id, version } = data;
      if (!id || typeof version !== "number") return;

      const lastSeen = seenRef.current.get(id);
      if (lastSeen !== undefined && version <= lastSeen) return;
      seenRef.current.set(id, version);
      handlerRef.current(data);
    };

    socket.on(event, listener);
    return () => {
      socket.off(event, listener);
    };
  }, [socket, event]);
}
