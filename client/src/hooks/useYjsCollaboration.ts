/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import * as Y from "yjs";
import { useSetRecoilState } from "recoil";
import { currentDocState } from "../atom";

export const useCustomYjsCollaboration = (
  userId: string,
  documentId: string
) => {
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setCurrentDoc = useSetRecoilState(currentDocState);
  const wsRef = useRef<WebSocket | null>(null);

  const connectToServer = useCallback(() => {
    const yDoc = new Y.Doc();
    const ws = new WebSocket("ws://localhost:8000/");

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
        case "sync": {
          Y.applyUpdate(
            yDoc,
            new Uint8Array(messageData.update),
            wsRef.current
          );
          break;
        }
        case "update": {
          Y.applyUpdate(
            yDoc,
            new Uint8Array(messageData.update),
            wsRef.current
          );
          break;
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
    setDoc(yDoc);

    return () => {
      ws.close();
    };
  }, [userId, documentId]);

  // handles local updates
  const sendUpdates = useCallback((update: Uint8Array, origin: any) => {
    if (origin !== wsRef.current) {
      try {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "update",
              updates: Array.from(update),
            })
          );
        }
      } catch (error) {
        console.error("Error sending update:", error);
        setError("Failed to send update");
      }
    }
  }, []);

  const getYText = useCallback(() => {
    return doc ? doc.getText("content") : null;
  }, [doc]);

  const updateYText = useCallback(
    (content: string) => {
      if (!doc) return;
      const ytext = doc.getText("content");
      doc.transact(() => {
        ytext.delete(0, ytext.length);
        ytext.insert(0, content);
      });
    },
    [doc]
  );

  useEffect(() => {
    const cleanup = connectToServer();
    return cleanup;
  }, [connectToServer]);

  // Sync changes to Ytext with the currentDoc state
  useEffect(() => {
    if (!doc) return;

    const ytext = doc.getText("content");
    const content = ytext.toString();
    setCurrentDoc((prevDoc) => ({ ...prevDoc, content }));

    const yjsObserver = () => {
      const content = ytext.toString();
      setCurrentDoc((prevDoc) => ({ ...prevDoc, content }));
    };

    ytext.observe(yjsObserver);

    return () => ytext.unobserve(yjsObserver);
  }, [doc, setCurrentDoc]);

  useEffect(() => {
    if (!doc) return;

    doc.on("update", sendUpdates);

    return () => {
      doc.off("update", sendUpdates);
    };
  }, [doc, sendUpdates]);

  return {
    isConnected,
    error,
    getYText,
    updateYText,
  };
};
