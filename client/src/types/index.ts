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

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  chatId: string;
  sender: {
    id: string;
    email: string;
  };
}
