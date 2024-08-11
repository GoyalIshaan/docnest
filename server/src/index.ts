import http from "http";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./routers/userRouter";
import docRouter from "./routers/docRouter";
import { authMiddleware } from "./auth";
import { setupWebSocketServer } from "./webSocketRouter";

dotenv.config();

const app = express();
const server = http.createServer(app);

const port = parseInt(process.env.PORT || "8000", 10);
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, welcome to the API!");
});

app.get("/api/", (req: Request, res: Response) => {
  res.send("Hello, welcome to the API Gateway!");
});

app.use("/api/user", userRouter);
app.use("/api/docs", authMiddleware, docRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

setupWebSocketServer(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
});
