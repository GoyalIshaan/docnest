import { PrismaClient } from "@prisma/client";
import { ExtWebSocket } from "../types";
import * as Y from "yjs";

export const docs = new Map<string, Y.Doc>();

export const workingDocuments = new Map<string, ExtWebSocket[]>();

export const chattingUsers = new Map<string, ExtWebSocket[]>();

export const prisma = new PrismaClient();
