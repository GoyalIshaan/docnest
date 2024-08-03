import { PrismaClient } from "@prisma/client";
import { IncomingMessage } from "../types";
import { WebSocket } from "ws";

const prisma = new PrismaClient();

const updateDoc = async (message: IncomingMessage, ws: WebSocket) => {
  const { docId, editorId, titleEdit, contentEdit } = message;

  try {
    const updatedDoc = await prisma.document.update({
      where: { id: docId },
      data: {
        title: titleEdit,
        content: contentEdit,
      },
    });

    if (!updatedDoc) {
      ws.send(JSON.stringify({ type: "error", message: "Document not found" }));
      return;
    }

    ws.send(
      JSON.stringify({
        type: "update",
        docId,
        editorId,
        titleEdit,
        contentEdit,
      })
    );
  } catch (error) {
    console.error("Error updating document:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "An error occurred while updating the document",
      })
    );
  }
};

export { updateDoc };
