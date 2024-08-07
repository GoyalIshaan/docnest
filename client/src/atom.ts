import { atom } from "recoil";
import { Doc, User } from "./types";

export const userState = atom<User>({
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
    createdAt: "",
    updatedAt: "",
    ownerId: "",
  },
});

export const sharedWithUsers = atom({
  key: "sharedUsers",
  default: [],
});
