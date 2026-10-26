import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { env } from "@/shared/lib/env";
import { getToken } from "@/shared/lib/auth-store";
import { connectSocket } from "./socket-client";

type SocketContextValue = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

function isMswReady(): boolean {
  if (!env.VITE_ENABLE_MOCKS) return true;
  if (typeof window === "undefined") return false;
  return (window as unknown as { __mswReady?: boolean }).__mswReady === true;
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const [mswReady, setMswReady] = useState(isMswReady);

  useEffect(() => {
    if (mswReady) return;
    const handler = () => setMswReady(true);
    window.addEventListener("msw:ready", handler);
    return () => window.removeEventListener("msw:ready", handler);
  }, [mswReady]);

  useEffect(() => {
    if (!mswReady) return;

    let cancelled = false;
    const token = getToken() ?? "";

    connectSocket({
      token,
      onConnect: () => {
        if (!cancelled) setIsConnected(true);
      },
      onDisconnect: () => {
        if (!cancelled) setIsConnected(false);
      },
      onError: () => {
        if (!cancelled) setIsConnected(false);
      },
    })
      .then((s) => {
        if (cancelled) {
          s.disconnect();
          return;
        }
        socketRef.current = s;
        setSocket(s);
      })
      .catch(() => {
        if (!cancelled) setIsConnected(false);
      });

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [mswReady]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext(): SocketContextValue {
  return useContext(SocketContext);
}
