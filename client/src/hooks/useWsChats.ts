import { useState, useEffect, useCallback, useRef } from "react";
import { useRecoilState } from "recoil";
import { messagesState } from "../atom";

export const useWebSocketMessageRouter = (
  userId: string,
  documentId: string
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useRecoilState(messagesState);
  const wsRef = useRef<WebSocket | null>(null);

  const connectToServer = useCallback(() => {
    const ws = new WebSocket("ws://localhost:8000");

    ws.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      setError(null);
      const joinMessage = {
        type: "joinChat",
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
          console.log("User joined:", messageData.userId);
          break;
        }
        case "newMessage": {
          setMessages((prevMessages) => [...prevMessages, messageData.message]);
          break;
        }
        case "deleteMessage": {
          setMessages((prevMessages) =>
            prevMessages.filter((message) => message.id !== messageData.id)
          );
          break;
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

    return () => {
      ws.close();
    };
  }, [userId, documentId, setMessages]);

  useEffect(() => {
    const cleanup = connectToServer();
    return cleanup;
  }, [connectToServer]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "createMessage",
          content,
        })
      );
    }
  }, []);
  const deleteMessage = useCallback((id: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("Deleting message:", id);
      wsRef.current.send(
        JSON.stringify({
          type: "deleteMessage",
          id,
        })
      );
    }
  }, []);

  return {
    isConnected,
    error,
    messages,
    sendMessage,
    deleteMessage,
  };
};
