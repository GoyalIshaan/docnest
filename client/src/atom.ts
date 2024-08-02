import { atom } from "recoil";

interface Doc {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export const userState = atom({
  key: "userState",
  default: {
    id: "",
    username: "",
    email: "",
  },
});

export const docsState = atom<Doc[]>({
  key: "docsState",
  default: [],
});

export const sharedDocsState = atom<Doc[]>({
  key: "sharedDocsState",
  default: [],
});

export const currentDocState = atom<Doc>({
  key: "currentDocState",
  default: {
    id: "",
    title: "",
    content: "",
    summary: "",
    tags: [],
    createdAt: "",
    updatedAt: "",
    ownerId: "",
  },
});

export const sharedWithUsers = atom({
  key: "sharedUsers",
  default: [],
});
