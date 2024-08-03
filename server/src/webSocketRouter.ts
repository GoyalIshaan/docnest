import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "./types";
import { updateDoc } from "./routers/wsRoutes";

const Document: Map<string, Set<WebSocket>> = new Map();

const webSocketRouter = (wss: WebSocketServer) => {
  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "Welcome to the WebSocket server!" }));
    ws.on("message", async (message: string) => {
      console.log(`Received message => ${message}`);
      let parsedMessage: IncomingMessage;
      try {
        parsedMessage = JSON.parse(message);
      } catch (error) {
        console.error("Error parsing message", error);
        return;
      }

      switch (parsedMessage.type) {
        case "joinedDoc": {
          Document.get(parsedMessage.docId)?.add(ws) ||
            Document.set(parsedMessage.docId, new Set([ws]));
          ws.send(
            JSON.stringify({
              type: "joinedDoc",
              docId: "connected to the document successfully",
            })
          );
          break;
        }
        case "edit": {
          console.log(
            `User ${parsedMessage.editorId} edited document ${parsedMessage.docId}`
          );

          updateDoc(parsedMessage, ws);

          break;
        }
        default:
          console.error("Invalid message type");
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });
  });
};

export default webSocketRouter;
