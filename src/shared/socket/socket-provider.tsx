import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/use-auth";
import { getToken } from "@/shared/lib/auth-store";
import { env } from "@/shared/lib/env";
import {
  cartKeys,
  nftKeys,
  orderKeys,
  quoteKeys,
} from "@/shared/api/query-keys";
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

function setSocketConnectedFlag(connected: boolean): void {
  if (typeof document === "undefined") return;
  document.body.dataset.socketConnected = connected ? "true" : "false";
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const hasConnectedOnceRef = useRef(false);
  const [mswReady, setMswReady] = useState(isMswReady);

  useEffect(() => {
    if (mswReady) return;
    const handler = () => setMswReady(true);
    window.addEventListener("msw:ready", handler);
    return () => window.removeEventListener("msw:ready", handler);
  }, [mswReady]);

  // Reconecta quando o usuário loga/desloga, para o socket refletir o
  // token atual (isolamento por usuário no mock, via filtro no cliente).
  useEffect(() => {
    if (!mswReady) return;

    let cancelled = false;
    const token = getToken() ?? "";

    const reconnect = async () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setSocketConnectedFlag(false);
      }

      try {
        const s = await connectSocket({
          token,
          onConnect: () => {
            if (cancelled) return;
            setIsConnected(true);
            setSocketConnectedFlag(true);
            if (hasConnectedOnceRef.current) {
              // Reconexão: invalida caches para o REST re-sincronizar.
              void queryClient.invalidateQueries({ queryKey: nftKeys.all });
              void queryClient.invalidateQueries({ queryKey: cartKeys.all });
              void queryClient.invalidateQueries({ queryKey: orderKeys.all });
              void queryClient.invalidateQueries({ queryKey: quoteKeys.all });
            }
            hasConnectedOnceRef.current = true;
          },
          onDisconnect: () => {
            if (!cancelled) {
              setIsConnected(false);
              setSocketConnectedFlag(false);
            }
          },
          onError: () => {
            if (!cancelled) {
              setIsConnected(false);
              setSocketConnectedFlag(false);
            }
          },
        });
        if (cancelled) {
          s.disconnect();
          return;
        }
        socketRef.current = s;
        setSocket(s);
      } catch {
        if (!cancelled) {
          setIsConnected(false);
          setSocketConnectedFlag(false);
        }
      }
    };

    void reconnect();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setSocketConnectedFlag(false);
    };
  }, [session?.user.id, mswReady, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext(): SocketContextValue {
  return useContext(SocketContext);
}
