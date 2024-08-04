import express from "express";
import { Request } from "express";
import { PrismaClient } from "@prisma/client";
import * as Automerge from "@automerge/automerge";
import { AutomergeDocument } from "../types";

const docRouter = express.Router();
const prisma = new PrismaClient();

// @desc Create A New Document
// @route POST /api/docs/
// @access Private
docRouter.post("/", async (req: Request, res) => {
  try {
    if (req.user === undefined) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const automergeDoc = Automerge.init<AutomergeDocument>();
    const updatedDoc = Automerge.change(automergeDoc, (doc) => {
      doc.title = "Untitled Document";
      doc.content = "";
      doc.tags = [];
    });

    const serializedDoc = Automerge.save(updatedDoc);

    const doc = await prisma.document.create({
      data: {
        automergeState: Buffer.from(serializedDoc),
        ownerId: req.user?.id,
      },
    });

    const loadedDoc = Automerge.load<AutomergeDocument>(doc.automergeState);

    res.status(201).json({
      id: doc.id,
      title: loadedDoc.title,
      content: loadedDoc.content,
      tags: loadedDoc.tags,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// @desc Fetch All User Documents
// @route GET /api/docs/
// @access Private
docRouter.get("/", async (req: Request, res) => {
  try {
    const docs = await prisma.document.findMany({
      where: {
        ownerId: req.user?.id,
      },
    });

    const processedDocs = docs.map((doc) => {
      const loadedDoc = Automerge.load<AutomergeDocument>(doc.automergeState);
      return {
        id: doc.id,
        title: loadedDoc.title,
        content: loadedDoc.content,
        tags: loadedDoc.tags,
        ownerId: doc.ownerId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });

    res.status(200).json({ docs: processedDocs });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// @desc Fetch All Shared Documents
// @route GET /api/docs/shared/
// @access Private
docRouter.get("/shared/", async (req: Request, res) => {
  try {
    const docs = await prisma.document.findMany({
      where: {
        sharedWith: {
          some: {
            id: req.user?.id,
          },
        },
      },
    });

    res.status(200).json({ docs });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// @desc Fetch A Single Document
// @route GET /api/docs/:id/
// @access Private
docRouter.get("/:id/", async (req: Request, res) => {
  try {
    const { id } = req.params;

    const doc = await prisma.document.findUnique({
      where: {
        id: id,
      },
    });

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const loadedDoc = Automerge.load<AutomergeDocument>(doc.automergeState);

    const sharedWith = await prisma.document.findUnique({
      where: {
        id: id,
      },
      select: {
        sharedWith: {
          select: {
            id: true,
          },
        },
      },
    });

    if (
      (sharedWith &&
        sharedWith.sharedWith.find((user) => user.id === req.user?.id)) ||
      doc.ownerId === req.user?.id
    ) {
      return res.status(200).json({
        id: doc.id,
        title: loadedDoc.title,
        content: loadedDoc.content,
        tags: loadedDoc.tags,
        ownerId: doc.ownerId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      });
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// @desc Fetch Shared Users
// @route GET /api/docs/:id/shared/
// @access Private
docRouter.get("/:id/shared/", async (req: Request, res) => {
  try {
    const { id } = req.params;
    const sharedWith = await prisma.document.findUnique({
      where: {
        id: id,
      },
      select: {
        sharedWith: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    res.status(200).json(sharedWith);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// @desc Add User To Document
// @route PUT /api/docs/:id/:email/
// @access Private
docRouter.put("/:id/:email/", async (req: Request, res) => {
  try {
    const { id, email } = req.params;

    const doc = await prisma.document.findUnique({
      where: {
        id: id,
      },
    });

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (req.user === undefined || req.user.id !== doc.ownerId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.document.update({
      where: {
        id: id,
      },
      data: {
        sharedWith: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    res.status(200).json({ message: "User added to document" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// @desc Remove User From Document
// @route DELETE /api/docs/:id/:email/
// @access Private
docRouter.delete("/:id/:email/", async (req: Request, res) => {
  try {
    const { id, email } = req.params;

    const doc = await prisma.document.findUnique({
      where: {
        id: id,
      },
    });

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (req.user === undefined || req.user.id !== doc.ownerId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.document.update({
      where: {
        id: id,
      },
      data: {
        sharedWith: {
          disconnect: {
            id: user.id,
          },
        },
      },
    });

    res.status(200).json({ message: "User removed from document" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// @desc Delete A Document
// @route DELETE /api/docs/:id/
// @access Private
docRouter.delete("/:id/", async (req: Request, res) => {
  try {
    const { id } = req.params;

    const doc = await prisma.document.findUnique({
      where: {
        id: id,
      },
    });

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (doc.ownerId !== req.user?.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.document.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({ message: "Document deleted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

export default docRouter;
