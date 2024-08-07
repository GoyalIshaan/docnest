export interface Doc {
  id: string;
  title: string;
  content: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface UpdateMessage {
  type: "update";
  update: number[];
}

export interface SyncMessage {
  type: "sync";
  update: number[];
}
