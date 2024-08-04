export interface Doc {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}
