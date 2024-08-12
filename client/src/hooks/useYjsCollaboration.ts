/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import * as Y from "yjs";
import { useSetRecoilState } from "recoil";
import { currentDocState } from "../atom";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

export const useCustomYjsCollaboration = (
  userId: string,
  documentId: string
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCurrentDoc = useSetRecoilState(currentDocState);
  const wsRef = useRef<WebSocket | null>(null);
  const docRef = useRef<Y.Doc>(new Y.Doc());

  const connectToServer = useCallback(() => {
    const ws = new WebSocket(`${WS_URL}`);

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      setError(null);
      ws.send(JSON.stringify({ type: "join", userId, documentId }));
    };

    ws.onmessage = (event: MessageEvent) => {
      const messageData = JSON.parse(event.data);
      const { type } = messageData;
      if (type === "sync") {
        const { update } = messageData;
        Y.applyUpdate(docRef.current, new Uint8Array(update));
      } else if (type === "update") {
        const { sender, update } = messageData;
        if (sender !== userId) {
          Y.applyUpdate(docRef.current, new Uint8Array(update));
        }
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
      setTimeout(connectToServer, 5000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error");
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [userId, documentId]);

  const sendUpdates = useCallback((update: Uint8Array) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "update",
          updates: Array.from(update),
        })
      );
    }
  }, []);

  useEffect(() => {
    const cleanup = connectToServer();
    return cleanup;
  }, [connectToServer]);

  useEffect(() => {
    const ytext = docRef.current.getText("content");
    const currentDocRef = docRef.current;

    const updateContent = () => {
      const content = ytext.toString();
      setCurrentDoc((prevDoc) => ({ ...prevDoc, content }));
    };

    ytext.observe(updateContent);
    currentDocRef.on("update", sendUpdates);

    return () => {
      ytext.unobserve(updateContent);
      currentDocRef.off("update", sendUpdates);
    };
  }, [sendUpdates, setCurrentDoc]);

  const getYText = useCallback(() => {
    return docRef.current.getText("content");
  }, []);

  const updateYText = useCallback((content: string) => {
    const ytext = docRef.current.getText("content");
    docRef.current.transact(() => {
      ytext.delete(0, ytext.length);
      ytext.insert(0, content);
    });
  }, []);

  return {
    isConnected,
    error,
    getYText,
    updateYText,
  };
};
