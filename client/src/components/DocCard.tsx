import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, MoreVertical, Trash2, Loader2 } from "lucide-react";
import { formatDate } from "../utils/formatDate";

interface DocCardProps {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  onDelete: (id: string) => Promise<void>;
  isDeletingGlobal: boolean;
}

const DocCard: React.FC<DocCardProps> = ({
  id,
  title,
  content,
  updatedAt,
  onDelete,
  isDeletingGlobal,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onDelete(id);
    } finally {
      setIsDeleting(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <Link
      to={`/docs/${id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-300 cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-md"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-blue-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[180px]">
              {title}
            </h3>
          </div>
          <div className="relative">
            <MoreVertical
              className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer hover:text-gray-600"
              onClick={handleMoreClick}
            />
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting || isDeletingGlobal}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isDeleting || isDeletingGlobal ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    {isDeleting || isDeletingGlobal ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="h-24 overflow-hidden mb-3">
          <p className="text-sm text-gray-600 line-clamp-3">{content}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
          <span>Last edited {formatDate(updatedAt)}</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500">
            Open document
          </span>
        </div>
      </div>
    </Link>
  );
};

export default DocCard;
