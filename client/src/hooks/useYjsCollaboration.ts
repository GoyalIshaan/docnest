/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const isLocalUpdate = useRef(false);

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
      const messageData = JSON.parse(event.data);
      const { type } = messageData;
      switch (type) {
        case "userJoined": {
          break;
        }
        case "sync": {
          Y.applyUpdate(yDoc, new Uint8Array(messageData.update));
          break;
        }
        case "update": {
          {
            Y.applyUpdate(yDoc, new Uint8Array(messageData.update));
            break;
          }
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
      console.log("Initial content:", content);
      setCurrentDoc((prevDoc) => ({ ...prevDoc, content }));

      const observer = () => {
        const content = ytext.toString();
        setCurrentDoc((prevDoc) => ({ ...prevDoc, content }));
      };

      ytext.observe(observer);

      return () => ytext.unobserve(observer);
    }
  }, [doc, setCurrentDoc]);

  useEffect(() => {
    if (doc) {
      doc.on("update", (update: Uint8Array, origin: any) => {
        if (origin !== wsRef.current) {
          sendUpdate(update);
        }
      });
    }
  }, [doc, sendUpdate]);

  const updateContent = useCallback(
    (content: string) => {
      if (doc) {
        const ytext = doc.getText("content");
        isLocalUpdate.current = true;
        doc.transact(() => {
          ytext.delete(0, ytext.length);
          ytext.insert(0, content);
        });
        isLocalUpdate.current = false;
      }
    },
    [doc]
  );

  return {
    isConnected,
    error,
    getYText,
    currentDoc,
    updateContent,
  };
};
