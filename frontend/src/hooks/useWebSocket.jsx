import { useState, useEffect, useRef, useCallback } from "react";

export default function useWebSocket(path, options = {}) {
  const { onMessage, onOpen, onClose, reconnect = true, maxRetries = 5 } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const retriesRef = useRef(0);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/${path}`;
    const ws = new WebSocket(url);
    ws.onopen = () => { setIsConnected(true); retriesRef.current = 0; onOpen && onOpen(); };
    ws.onmessage = (event) => {
      try { const data = JSON.parse(event.data); setLastMessage(data); onMessage && onMessage(data); }
      catch { setLastMessage(event.data); onMessage && onMessage(event.data); }
    };
    ws.onclose = () => {
      setIsConnected(false); onClose && onClose();
      if (reconnect && retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        setTimeout(connect, Math.min(1000 * Math.pow(2, retriesRef.current), 30000));
      }
    };
    ws.onerror = () => ws.close();
    wsRef.current = ws;
  }, [path, onMessage, onOpen, onClose, reconnect, maxRetries]);

  useEffect(() => { connect(); return () => { if (wsRef.current) wsRef.current.close(); }; }, [connect]);

  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
      wsRef.current.send(typeof data === "string" ? data : JSON.stringify(data));
  }, []);

  return { isConnected, lastMessage, sendMessage };
}
