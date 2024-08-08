import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Message } from "../types";
import Avatar from "react-avatar";
import { useGetUserById } from "../hooks/useUser";
import { formatDate } from "../utils/formatDate";
import { TrashIcon } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  deleteMessage: (id: string) => void;
}

const MessageCard = ({
  message,
  isOwnMessage,
  deleteMessage,
}: ChatMessageProps) => {
  const { getUserById, user, loading } = useGetUserById();
  const [username, setUsername] = useState("");
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    getUserById(message.sender.id);
  }, [message.sender.id, getUserById]);

  useEffect(() => {
    if (user && typeof user === "object" && "username" in user) {
      setUsername(user.username);
    }
  }, [user]);

  const formattedDate = formatDate(message.createdAt);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMessage(message.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-4 flex items-start ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwnMessage && (
        <Avatar name={username} size="32" round={true} className="mr-2 mt-1" />
      )}
      <div
        className={`flex flex-col ${
          isOwnMessage ? "items-end" : "items-start"
        }`}
      >
        {!isOwnMessage && (
          <div className="text-xs text-gray-500 mb-1">
            {!loading && username}
          </div>
        )}
        <div
          className={`relative max-w-xs lg:max-w-md ${
            isOwnMessage ? "text-right" : "text-left"
          }`}
        >
          <span
            className={`inline-block p-2 rounded-lg ${
              isOwnMessage
                ? "bg-blue-500 text-white rounded-br-none"
                : "bg-gray-200 text-gray-800 rounded-bl-none"
            }`}
          >
            {message.content}
          </span>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showActions ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-gray-400 mt-1 flex items-center justify-between"
          >
            <span>{formattedDate}</span>
            {isOwnMessage && (
              <button
                onClick={handleDelete}
                className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
              >
                <TrashIcon size={16} />
              </button>
            )}
          </motion.div>
        </div>
      </div>
      {isOwnMessage && (
        <Avatar
          name={username || message.sender.email}
          size="32"
          round={true}
          className="ml-2 mt-1"
        />
      )}
    </motion.div>
  );
};

export default MessageCard;
