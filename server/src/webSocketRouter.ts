import { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";
import * as Automerge from "@automerge/automerge";
import { AutomergeDocument, ExtWebSocket } from "./types";

const prisma = new PrismaClient();

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: ExtWebSocket) => {
    console.log("New WebSocket connection");

    ws.on("message", async (message: string) => {
      const data = JSON.parse(message);

      switch (data.type) {
        case "join":
          handleJoin(ws, data);
          break;
        case "update":
          await handleUpdate(ws, data, wss);
          break;
        default:
          console.warn("Unknown message type:", data.type);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });

  return wss;
}

async function handleJoin(
  ws: ExtWebSocket,
  data: { userId: string; documentId: string }
) {
  ws.userId = data.userId;
  ws.documentId = data.documentId;
  console.log(`User ${ws.userId} joined document ${ws.documentId}`);
}

async function handleUpdate(
  ws: ExtWebSocket,
  data: { docId: string; changes: number[][] },
  wss: WebSocketServer
) {
  if (!data.docId) {
    console.error("No document ID provided");
    return;
  }

  try {
    const doc = await prisma.document.findUnique({
      where: { id: data.docId },
    });

    if (!doc) {
      console.error(`Document ${data.docId} not found`);
      return;
    }

    let automergeDoc = Automerge.load<AutomergeDocument>(doc.automergeState);

    // Convert the changes array back to Uint8Array[]
    const changesUint8Array = data.changes.map(
      (change) => new Uint8Array(change)
    );
    console.log("Applying changes:", changesUint8Array);
    [automergeDoc] = Automerge.applyChanges(automergeDoc, changesUint8Array);
    console.log("New document state:", automergeDoc);

    await prisma.document.update({
      where: { id: data.docId },
      data: { automergeState: Buffer.from(Automerge.save(automergeDoc)) },
    });

    // Broadcast changes to all clients except the sender
    wss.clients.forEach((client: ExtWebSocket) => {
      if (
        client !== ws &&
        client.documentId === data.docId &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(
          JSON.stringify({
            type: "update",
            docId: data.docId,
            changes: data.changes,
          })
        );
      }
    });
  } catch (error) {
    console.error("Error handling document update:", error);
  }
}
