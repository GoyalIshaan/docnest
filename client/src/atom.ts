import { atom } from "recoil";
import * as Automerge from "@automerge/automerge";
import { AutomergeDocument, Doc, User } from "./types";

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
    createdAt: "",
    updatedAt: "",
    ownerId: "",
  },
});

export const sharedWithUsers = atom({
  key: "sharedUsers",
  default: [],
});

export const automergeDocState = atom<AutomergeDocument>({
  key: "automergeDocState",
  default: Automerge.init<AutomergeDocument>(),
});
