import { ExtWebSocket } from "../types";
import * as Y from "yjs";
import WebSocket from "ws";
import { docs, prisma, workingDocuments } from "./wsDataTypes";

let pastUpdates: number[] = [];

export async function handleJoin(
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
  ws.send(
    JSON.stringify({
      type: "sync",
      update: Array.from(initialUpdate),
    })
  );
}

export function handleUpdate(ws: ExtWebSocket, updates: number[]) {
  if (!ws.yDoc || !ws.documentId) return;

  if (updates != pastUpdates) {
    Y.applyUpdate(ws.yDoc, new Uint8Array(updates), ws);
    pastUpdates = updates;
    broadcastUpdate(ws.documentId, updates, ws);
  } else {
    return;
  }
}

function broadcastUpdate(
  docId: string,
  update: number[],
  sender: ExtWebSocket
) {
  const clients = workingDocuments.get(docId) || [];
  clients.forEach((client: ExtWebSocket) => {
    if (
      client !== sender &&
      client.userId !== sender.userId &&
      client.readyState === WebSocket.OPEN
    ) {
      console.log("Broadcasting update to client");
      client.send(
        JSON.stringify({ type: "update", update, sender: sender.userId })
      );
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

export async function saveDocument(docId: string, ydoc: Y.Doc) {
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
