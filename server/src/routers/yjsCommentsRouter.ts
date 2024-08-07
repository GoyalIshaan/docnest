import { ExtWebSocket } from "../types";
import * as Y from "yjs";
import { comments, prisma, workingDocuments } from "./wsDataTypes";

export const initializeComments = async (documentId: string, doc: Y.Doc) => {
  let commentsArray = comments.get(documentId);
  if (!commentsArray) {
    commentsArray = doc.getArray("comments");
    comments.set(documentId, commentsArray);
    await loadComments(documentId, commentsArray);
  }

  return commentsArray;
};

export const handleCommentUpdate = (ws: ExtWebSocket, commentUpdate: any) => {
  if (!ws.documentId) return;

  const commentsArray = comments.get(ws.documentId);
  if (!commentsArray) return;

  switch (commentUpdate.action) {
    case "add": {
      commentsArray.push([commentUpdate.comment]);
      break;
    }
    case "delete": {
      const index = commentsArray
        .toArray()
        .findIndex((comment) => comment.id === commentUpdate.comment.id);
      if (index !== -1) {
        commentsArray.delete(index, 1);
      }
      break;
    }
    case "update": {
      const index = commentsArray
        .toArray()
        .findIndex((comment) => comment.id === commentUpdate.comment.id);
      if (index !== -1) {
        commentsArray.delete(index, 1);
        commentsArray.insert(index, [commentUpdate.comment]);
      }
      break;
    }
    default: {
      console.log("Invalid comment action");
    }
  }

  broadcastCommentUpdate(commentUpdate, ws);
};

const broadcastCommentUpdate = (commentUpdate: any, sender: ExtWebSocket) => {
  const documentId = sender.documentId;
  if (!documentId) return;
  const clients = workingDocuments.get(documentId) || [];
  clients.forEach((client: ExtWebSocket) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "commentUpdate", commentUpdate }));
    }
  });
};

export const loadComments = async (
  docId: string,
  commentsArray: Y.Array<any>
) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { documentId: docId },
      orderBy: { createdAt: "asc" },
    });
    comments.forEach((comment) => {
      commentsArray.push([
        {
          ...comment,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
        },
      ]);
    });
  } catch (error) {
    console.error("Error loading comments:", error);
  }
};

export const saveComments = async (
  documentId: string,
  commentArray: Y.Array<any>
) => {
  try {
    const comments = commentArray.toArray();

    await prisma.$transaction(async (prisma) => {
      await prisma.comment.deleteMany({
        where: { documentId },
      });

      await prisma.comment.createMany({
        data: comments.map((comment) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt),
        })),
      });
    });

    console.log(`Comments for document ${documentId} saved`);
  } catch (error) {
    console.error("Error saving comments:", error);
  }
};
