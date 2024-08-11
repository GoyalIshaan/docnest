import { Server } from "http";
import WebSocket from "ws";
import { ExtWebSocket } from "./types";
import { chattingUsers, docs, workingDocuments } from "./routers/wsDataTypes";
import {
  handleJoin,
  handleUpdate,
  saveDocument,
} from "./routers/yjsDocsRouter";
import {
  deleteMessage,
  handleJoinChat,
  sendMessage,
} from "./routers/wsChatRouter";

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws: ExtWebSocket) => {
    ws.isAlive = true;

    ws.on("message", async (message: string) => {
      console.log("Received message:", message);
      try {
        const data = JSON.parse(message);
        switch (data.type) {
          case "join": {
            const { userId, documentId } = data;
            if (!userId || !documentId) {
              errorResponse(ws, "Invalid join message");
              return;
            }
            await handleJoin(ws, userId, documentId);
            break;
          }
          case "joinChat": {
            handleJoinChat(ws, data.userId, data.documentId);
            break;
          }
          case "update": {
            const { updates } = data;
            if (!updates) {
              errorResponse(ws, "Invalid update message");
              return;
            }
            handleUpdate(ws, updates);
            break;
          }
          case "createMessage": {
            const { content } = data;
            if (!content) {
              errorResponse(ws, "Invalid message content");
              return;
            }
            sendMessage(ws, content);
            break;
          }
          case "deleteMessage": {
            const { id } = data;
            if (!id) {
              errorResponse(ws, "Invalid message ID");
              return;
            }
            deleteMessage(ws, id);
            break;
          }
          default: {
            ws.send(
              JSON.stringify({ type: "error", message: "Unknown message type" })
            );
          }
        }
      } catch (error) {
        console.error("Error handling message:", error);
        ws.send(
          JSON.stringify({ type: "error", message: "Invalid message format" })
        );
      }
    });

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      if (ws.documentId) {
        const clients = workingDocuments.get(ws.documentId) || [];
        const updatedClients = clients.filter((client) => client !== ws);
        workingDocuments.set(ws.documentId, updatedClients);

        const users = chattingUsers.get(ws.documentId) || [];
        const updatedUsers = users.filter((user) => user !== ws);
        chattingUsers.set(ws.documentId, updatedUsers);

        if (updatedClients.length === 0) {
          docs.delete(ws.documentId);
        }
      }
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws: ExtWebSocket) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 30000);

  wss.on("close", (ws: ExtWebSocket) => {
    clearInterval(interval);
  });

  // Periodically save all active documents
  setInterval(() => {
    docs.forEach((doc, docId) => {
      saveDocument(docId, doc);
    });
  }, 5000);
}

const errorResponse = (ws: ExtWebSocket, message: string) => {
  ws.send(JSON.stringify({ type: "error", message }));
};
