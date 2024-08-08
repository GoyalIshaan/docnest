import { Message, PrismaClient } from "@prisma/client";
import { ExtWebSocket } from "../types";
import { chattingUsers } from "./wsDataTypes";
import { WebSocket } from "ws";

const prisma = new PrismaClient();

export const handleJoinChat = async (
  ws: ExtWebSocket,
  userId: string,
  documentId: string
) => {
  console.log("User joined chat:", userId, documentId);
  try {
    ws.userId = userId;
    ws.documentId = documentId;
    if (chattingUsers.has(documentId)) {
      chattingUsers.get(documentId)?.push(ws);
    } else {
      chattingUsers.set(documentId, [ws]);
    }
  } catch (error) {
    ws.send(JSON.stringify({ type: "error", error }));
  }
};

export const sendMessage = async (ws: ExtWebSocket, content: string) => {
  try {
    if (ws.documentId === undefined || ws.userId === undefined) {
      ws.send(JSON.stringify({ type: "error", error: "Invalid message" }));
      return;
    }

    const message: Message = await prisma.message.create({
      data: {
        content,
        chatId: ws.documentId,
        senderId: ws.userId,
      },
    });
    broadcastMessage(message, ws);
  } catch (error) {
    ws.send(JSON.stringify({ type: "error", error }));
  }
};

export const deleteMessage = async (ws: ExtWebSocket, id: string) => {
  try {
    if (ws.documentId === undefined || ws.userId === undefined) {
      ws.send(JSON.stringify({ type: "error", error: "Invalid message" }));
      return;
    }
    console.log("Deleting message:", id);

    const exists = await prisma.message.findFirst({
      where: {
        id,
        chatId: ws.documentId,
        senderId: ws.userId,
      },
    });

    if (!exists) {
      ws.send(
        JSON.stringify({ type: "error", error: "Message does not exist" })
      );
      return;
    }

    await prisma.message.delete({
      where: {
        id,
      },
    });

    broadcastDeleteMessage(id, ws);
  } catch (error) {
    ws.send(JSON.stringify({ type: "error", error }));
  }
};

export const broadcastMessage = (message: Message, ws: ExtWebSocket) => {
  const documentId = ws.documentId;
  if (documentId === undefined) {
    return;
  }
  const users = chattingUsers.get(documentId);
  if (users === undefined) {
    return;
  }
  console.log("Broadcasting message:", message);
  users.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "newMessage",
          message: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
            chatId: message.chatId,
            sender: {
              id: message.senderId,
            },
          },
        })
      );
    }
  });
};

export const broadcastDeleteMessage = (id: string, ws: ExtWebSocket) => {
  // Implement this function
  const documentId = ws.documentId;
  if (documentId === undefined) {
    return;
  }
  const users = chattingUsers.get(documentId);
  if (users === undefined) {
    return;
  }

  users.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "deleteMessage",
          id: id,
        })
      );
    }
  });
};
