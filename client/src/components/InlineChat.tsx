import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useRecoilValue } from "recoil";
import { currentDocState, userState } from "../atom";
import { useWebSocketMessageRouter } from "../hooks/useWsChats";
import { useGetDocMessages } from "../hooks/useDocs";
import MessageCard from "./MessageCard";

const InlineChat: React.FC = () => {
  const userId = useRecoilValue(userState).id;
  const documentId = useRecoilValue(currentDocState).id;
  const { isConnected, error, messages, sendMessage, deleteMessage } =
    useWebSocketMessageRouter(userId, documentId);
  const [inputMessage, setInputMessage] = useState("");
  const { getDocMessages } = useGetDocMessages();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDocMessages(documentId);
  }, [documentId, getDocMessages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-[55%] bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <div className="bg-gray-100 px-4 py-2 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Doc Chat</h3>
      </div>

      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageCard
            key={msg.id}
            message={msg}
            isOwnMessage={msg.sender.id === userId}
            deleteMessage={deleteMessage}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow px-3 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </motion.button>
        </div>
      </form>

      {!isConnected && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-center py-2 bg-red-100 text-sm"
        >
          Not connected. Please check your connection.
        </motion.p>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-center py-2 bg-red-100 text-sm"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
};

export default InlineChat;
