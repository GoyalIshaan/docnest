import * as Y from "yjs";
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

export interface ExtWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
  documentId?: string;
  yDoc?: Y.Doc;
}
