import { Server } from "http";
import WebSocket from "ws";
import { WebSocketServer } from "ws";
import { PrismaClient } from "@prisma/client";
import * as Automerge from "@automerge/automerge";
import { AutomergeDocument, ExtWebSocket } from "./types";

const prisma = new PrismaClient();

const documentStates = new Map<string, WebSocket[]>();

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("New WebSocket connection");

    ws.on("message", async (message: string) => {
      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case "join":
            await handleJoin(ws, data);
            break;
          case "update":
            await handleUpdate(ws, data);
            break;
          default:
            ws.send(
              JSON.stringify({ type: "error", message: "Unknown message type" })
            );
        }
      } catch (error) {
        console.error("Error processing message:", error);
        ws.send(
          JSON.stringify({ type: "error", message: "Error processing message" })
        );
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });

  return wss;
}

async function handleJoin(
  ws: WebSocket,
  data: { userId: string; documentId: string }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      ws.send(
        JSON.stringify({ type: "error", message: "Authentication failed" })
      );
      return;
    }

    const document = await prisma.document.findUnique({
      where: { id: data.documentId },
      include: { sharedWith: true },
    });

    if (
      !document ||
      (document.ownerId !== user.id &&
        !document.sharedWith.some((u) => u.id === user.id))
    ) {
      ws.send(JSON.stringify({ type: "error", message: "Access denied" }));
      return;
    }

    documentStates.set(data.documentId, [
      ...(documentStates.get(data.documentId) || []),
      ws,
    ]);

    ws.send(JSON.stringify({ type: "joined", documentId: data.documentId }));
  } catch (error) {
    console.error("Error in handleJoin:", error);
    ws.send(
      JSON.stringify({ type: "error", message: "Error joining document" })
    );
  }
}

async function handleUpdate(
  ws: ExtWebSocket,
  data: { docId: string; changes: number[][] }
) {
  if (!data.docId) {
    ws.send(
      JSON.stringify({ type: "error", message: "No document ID provided" })
    );
    return;
  }

  try {
    const doc = await prisma.document.findUnique({
      where: { id: data.docId },
    });

    if (!doc) {
      ws.send(JSON.stringify({ type: "error", message: "Document not found" }));
      return;
    }

    let automergeDoc = Automerge.load<AutomergeDocument>(doc.automergeState);

    const changesUint8Array = data.changes.map(
      (change) => new Uint8Array(change)
    );

    [automergeDoc] = Automerge.applyChanges(automergeDoc, changesUint8Array);

    await prisma.document.update({
      where: { id: data.docId },
      data: { automergeState: Buffer.from(Automerge.save(automergeDoc)) },
    });

    broadcastUpdate(data.docId, ws, {
      type: "update",
      docId: data.docId,
      changes: data.changes,
    });
  } catch (error) {
    console.error("Error handling document update:", error);
    ws.send(
      JSON.stringify({ type: "error", message: "Error updating document" })
    );
  }
}

function broadcastUpdate(
  documentId: string,
  sender: ExtWebSocket,
  message: any
) {
  const clients = documentStates.get(documentId);
  if (!clients) {
    return;
  }

  console.log("Broadcasting update to", clients.length, "clients");

  clients.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
