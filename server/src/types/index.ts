import { WebSocket } from "ws";

export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
}

export interface UserPayload {
  id: string;
  username: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export interface IncomingMessage {
  type: "joinedDoc" | "edit";
  docId: string;
  editorId: string;
  titleEdit: string;
  contentEdit: string;
}

export interface AutomergeDocument {
  title: string;
  content: string;
  tags: string[];
}

export interface ExtWebSocket extends WebSocket {
  userId?: string;
  documentId?: string;
}
