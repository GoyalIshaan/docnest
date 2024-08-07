import React from "react";
import CommentCard from "./CommentCard";

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  range?: { index: number; length: number };
}

interface InlineCommentsProps {
  comments: Comment[];
}

const InlineComments: React.FC<InlineCommentsProps> = ({ comments }) => {
  return (
    <div className="h-full overflow-y-auto">
      <h3 className="text-2xl font-bold py-2 text-slate-700 mb-4">Comments</h3>

      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          author={comment.author}
          content={comment.content}
          timestamp={comment.timestamp}
        />
      ))}
    </div>
  );
};

export default InlineComments;
