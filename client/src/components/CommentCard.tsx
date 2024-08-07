import React from "react";

interface CommentCardProps {
  author: string;
  content: string;
  timestamp: string;
}

const CommentCard: React.FC<CommentCardProps> = ({
  author,
  content,
  timestamp,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-blue-600">{author}</span>
        <span className="text-sm text-gray-500">{timestamp}</span>
      </div>
      <p className="text-gray-700">{content}</p>
    </div>
  );
};

export default CommentCard;
