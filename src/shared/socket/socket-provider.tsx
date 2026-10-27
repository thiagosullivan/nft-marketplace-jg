import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_CHANGED_EVENT, getToken } from "@/shared/lib/auth-store";
import { env } from "@/shared/lib/env";
import {
  cartKeys,
  nftKeys,
  orderKeys,
  quoteKeys,
} from "@/shared/api/query-keys";
import { connectSocket } from "./socket-client";
import { SocketContext } from "./socket-context";

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
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string | null>(() => getToken());
  const socketRef = useRef<Socket | null>(null);
  const hasConnectedOnceRef = useRef(false);
  const [mswReady, setMswReady] = useState(isMswReady);

  // MSW ready
  useEffect(() => {
    if (mswReady) return;
    const handler = () => setMswReady(true);
    window.addEventListener("msw:ready", handler);
    return () => window.removeEventListener("msw:ready", handler);
  }, [mswReady]);

  // Auth changes (login/logout) → atualiza token e força reconexão
  useEffect(() => {
    const handler = () => setToken(getToken());
    window.addEventListener(AUTH_CHANGED_EVENT, handler);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, handler);
  }, []);

  // Reconecta quando token ou mswReady mudam
  useEffect(() => {
    if (!mswReady) return;

    let cancelled = false;
    const currentToken = token ?? "";

    const reconnect = async () => {
      // Aguarda o interceptor de socket estar aplicado (main.tsx expõe
      // `__socketReady`). Sem isso, o socket conectaria antes do binding
      // do MSW e o handshake iria para o servidor do Vite.
      await (window as unknown as { __socketReady?: Promise<void> })
        .__socketReady;

      if (cancelled) return;

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setSocketConnectedFlag(false);
      }

      try {
        const s = await connectSocket({
          token: currentToken,
          onConnect: () => {
            if (cancelled) return;
            setIsConnected(true);
            setSocketConnectedFlag(true);
            if (hasConnectedOnceRef.current) {
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
  }, [token, mswReady, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
