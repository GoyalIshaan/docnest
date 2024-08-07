import { useState, useEffect, useCallback, useRef } from "react";
import * as Y from "yjs";
import { useRecoilState } from "recoil";
import { currentDocState } from "../atom";

export const useCustomYjsCollaboration = (
  userId: string,
  documentId: string
) => {
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDoc, setCurrentDoc] = useRecoilState(currentDocState);
  const wsRef = useRef<WebSocket | null>(null);

  const connectToServer = useCallback(() => {
    const yDoc = new Y.Doc();
    const ws = new WebSocket("ws://localhost:8000");

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      setError(null);
      const joinMessage = {
        type: "join",
        userId,
        documentId,
      };
      ws.send(JSON.stringify(joinMessage));
    };

    ws.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      const { type } = message;
      switch (type) {
        case "userJoined": {
          break;
        }
        case "sync": {
          Y.applyUpdate(yDoc, new Uint8Array(message.update));
          break;
        }
        case "update": {
          {
            Y.applyUpdate(yDoc, new Uint8Array(message.update));
            break;
          }
        }
        default: {
          console.log("Unknown message type:", type);
        }
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error");
    };

    wsRef.current = ws;
    setDoc(yDoc);

    return () => {
      ws.close();
    };
  }, [userId, documentId]);

  useEffect(() => {
    const cleanup = connectToServer();
    return cleanup;
  }, [connectToServer]);

  const sendUpdate = useCallback((update: Uint8Array) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "update",
          updates: Array.from(update),
        })
      );
    }
  }, []);

  const getYText = useCallback(() => {
    return doc ? doc.getText("content") : null;
  }, [doc]);

  useEffect(() => {
    if (doc) {
      const ytext = doc.getText("content");
      const content = ytext.toString();
      setCurrentDoc((prevDoc) => ({ ...prevDoc, content }));

      const observer = () => {
        setCurrentDoc((prevDoc) => ({ ...prevDoc, content: ytext.toString() }));
      };

      ytext.observe(observer);

      return () => ytext.unobserve(observer);
    }
  }, [doc, setCurrentDoc]);

  useEffect(() => {
    if (doc) {
      doc.on("update", (update: Uint8Array) => {
        sendUpdate(update);
      });
    }
  }, [doc, sendUpdate]);

  return {
    isConnected,
    error,
    getYText,
    currentDoc,
  };
};
