import { Server } from "http";
import * as Y from "yjs";
import { PrismaClient } from "@prisma/client";
import WebSocket from "ws";
import { ExtWebSocket, IncomingMessage } from "./types";

const prisma = new PrismaClient();

const docs = new Map<string, Y.Doc>();

const workingDocuments = new Map<string, ExtWebSocket[]>();

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws: ExtWebSocket) => {
    ws.isAlive = true;

    ws.on("message", async (message: string) => {
      try {
        const data: IncomingMessage = JSON.parse(message);
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
          case "update":
            const { updates } = data;
            if (!updates) {
              errorResponse(ws, "Invalid update message");
              return;
            }
            handleUpdate(ws, updates);
            break;
          default:
            ws.send(
              JSON.stringify({ type: "error", message: "Unknown message type" })
            );
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
        console.log(`Client disconnected from document ${ws.documentId}`);
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

  wss.on("close", () => {
    clearInterval(interval);
  });

  // Periodically save all active documents
  setInterval(() => {
    docs.forEach((doc, docId) => saveDocument(docId, doc));
  }, 5000);
}

const errorResponse = (ws: ExtWebSocket, message: string) => {
  ws.send(JSON.stringify({ type: "error", message }));
};

async function handleJoin(
  ws: ExtWebSocket,
  userId: string,
  documentId: string
) {
  ws.userId = userId;
  ws.documentId = documentId;

  let doc = docs.get(documentId);
  if (!doc) {
    doc = new Y.Doc();
    docs.set(documentId, doc);
    await loadDocumentContent(documentId, doc);
  }
  const clients = workingDocuments.get(documentId) || [];
  workingDocuments.set(documentId, [...clients, ws]);

  ws.yDoc = doc;

  // Send the initial document state to the client
  const initialUpdate = Y.encodeStateAsUpdate(doc);
  ws.send(JSON.stringify({ type: "sync", update: Array.from(initialUpdate) }));

  console.log(`Client ${ws.userId} joined document ${ws.documentId}`);
}

function handleUpdate(ws: ExtWebSocket, updates: number[]) {
  if (!ws.yDoc || !ws.documentId) return;

  // Apply the update to the Yjs document
  Y.applyUpdate(ws.yDoc, new Uint8Array(updates));

  // Broadcast the update to all other clients
  broadcastUpdate(ws.documentId, updates, ws);
}

// HERE GOES EVERYTHIN THAT WORKS

function broadcastUpdate(
  docId: string,
  update: number[],
  sender: ExtWebSocket
) {
  const clients = workingDocuments.get(docId) || [];
  clients.forEach((client: ExtWebSocket) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "update", update }));
    }
  });
}

async function loadDocumentContent(docId: string, ydoc: Y.Doc) {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: docId },
    });

    if (doc && doc.content) {
      Y.applyUpdate(ydoc, new Uint8Array(doc.content));
    }
  } catch (error) {
    console.error("Error loading document content:", error);
  }
}

async function saveDocument(docId: string, ydoc: Y.Doc) {
  try {
    const content = Y.encodeStateAsUpdate(ydoc);
    await prisma.document.update({
      where: { id: docId },
      data: { content: Buffer.from(content) },
    });
    console.log(`Document ${docId} saved`);
  } catch (error) {
    console.error("Error saving document:", error);
  }
}
