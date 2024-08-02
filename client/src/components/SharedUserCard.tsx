import React from "react";
import { Trash2, Loader } from "lucide-react";

interface SharedUserCardProps {
  user: {
    id: string;
    email: string;
  };
  canRemove: boolean;
  onRemove: (email: string) => void;
  isRemoving: boolean;
}

const SharedUserCard: React.FC<SharedUserCardProps> = ({
  user,
  canRemove,
  onRemove,
  isRemoving,
}) => {
  return (
    <li className="flex justify-between items-center bg-gray-100 p-2 rounded">
      <span>{user.email}</span>
      {canRemove && (
        <button
          onClick={() => onRemove(user.email)}
          disabled={isRemoving}
          className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRemoving ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      )}
    </li>
  );
};

export default SharedUserCard;
