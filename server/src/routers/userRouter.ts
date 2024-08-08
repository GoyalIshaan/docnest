import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser, UserPayload } from "../types";

const userRouter = express.Router();
const prisma = new PrismaClient();

//JWT Token generator
const tokenGenerator = (user: IUser) => {
  console.log("i am getting this user", user);
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    process.env.JWT_SECRET || "",
    { expiresIn: "7d" }
  );

  return token;
};

// @desc Auto Sign In
// @route GET /api/user/me/
// @access Private
userRouter.get("/me/", async (req, res) => {
  const token = req.cookies.cookie;

  if (!token) {
    console.log("No token found");
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as UserPayload;
    res.status(200).json({ user: decoded });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

//@desc Create A New User
//@route POST /api/user/
//@access Public
userRouter.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const exists = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    console.log(username, email, password);

    if (exists) {
      res.status(400).json({ error: "User already exists" });
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log(user);

    const token = tokenGenerator(user);

    res.cookie("cookie", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

//@desc Login User
//@route POST /api/user/me/
//@access Private
userRouter.post("/me/", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = tokenGenerator(user);

    res.cookie("cookie", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// @desc Logout User
// @route PUT /api/user/
// @access Private
userRouter.put("/", async (req, res) => {
  try {
    res.clearCookie("cookie");
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// @desc Get User By Email
// @route GET /api/user/:email/
// @access Private
userRouter.get("/:email/", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

// @desc Get User By Email
// @route GET /api/user/id/:email/
// @access Private
userRouter.get("/id/:id/", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});
export default userRouter;
