"use client";

import { useEffect, useRef } from "react";
import { wsManager, WebSocketMessage } from "@/lib/websocket";

export function useWebSocket(onMessage: (message: WebSocketMessage) => void) {
  const handlerRef = useRef(onMessage);
  
  // Keep handler ref up to date
  useEffect(() => {
    handlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    // Subscribe to WebSocket messages
    const unsubscribe = wsManager.subscribe((message) => {
      handlerRef.current(message);
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);
}

