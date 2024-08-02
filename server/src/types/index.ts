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
