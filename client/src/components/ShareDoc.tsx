import React, { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { currentDocState, userState, sharedWithUsers } from "../atom";
import { Share2, X, UserPlus, Loader } from "lucide-react";
import {
  useGetCollaborators,
  useAddCollaborator,
  useRemoveCollaborator,
} from "../hooks/useDocs";
import toast, { Toaster } from "react-hot-toast";
import SharedUserCard from "./SharedUserCard";

interface SharedUser {
  id: string;
  email: string;
}

const ShareComponent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const currentDoc = useRecoilValue(currentDocState);
  const currentUser = useRecoilValue(userState);
  const sharedUsers = useRecoilValue(sharedWithUsers);

  const {
    getCollaborators,
    loading: loadingCollaborators,
    error: collaboratorsError,
  } = useGetCollaborators();
  const {
    addCollaborator,
    loading: addingCollaborator,
    error: addError,
  } = useAddCollaborator();
  const {
    removeCollaborator,
    loading: removingCollaborator,
    error: removeError,
  } = useRemoveCollaborator();

  useEffect(() => {
    if (isModalOpen && currentDoc.id) {
      getCollaborators(currentDoc.id);
    }
  }, [isModalOpen, getCollaborators, currentDoc.id]);

  const handleShare = async () => {
    if (!canShare) {
      toast.error("Only the document owner can share this document.");
      return;
    }

    if (email && currentDoc.id) {
      try {
        await addCollaborator(currentDoc.id, email);
        setEmail("");
        await getCollaborators(currentDoc.id);
        toast.success("User added successfully!");
      } catch (error) {
        console.error("Error adding collaborator:", error);
        toast.error("Failed to add user. Please try again.");
      }
    }
  };

  const handleRemoveUser = async (email: string) => {
    if (!canShare) {
      toast.error("Only the document owner can remove shared users.");
      return;
    }

    if (currentDoc.id) {
      try {
        await removeCollaborator(currentDoc.id, email);
        await getCollaborators(currentDoc.id);
        toast.success("User removed successfully!");
      } catch (error) {
        console.error("Error removing collaborator:", error);
        toast.error("Failed to remove user. Please try again.");
      }
    }
  };

  const canShare = currentUser.id === currentDoc.ownerId;

  return (
    <>
      <Toaster />
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        <Share2 className="w-5 h-5 mr-2" />
        Share
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Share Document</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Share with (email):
              </label>
              <div className="flex">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow mr-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                  disabled={!canShare}
                />
                <button
                  onClick={handleShare}
                  disabled={addingCollaborator || !canShare}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingCollaborator ? (
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-5 h-5 mr-2" />
                  )}
                  Add
                </button>
              </div>
              {addError && (
                <p className="text-red-500 text-sm mt-1">
                  There was an error in adding the given email
                </p>
              )}
              {!canShare && (
                <p className="text-yellow-500 text-sm mt-1">
                  Only the document owner can add new users.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Shared with:</h3>
              {loadingCollaborators ? (
                <div className="flex justify-center">
                  <Loader className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : collaboratorsError ? (
                <p className="text-red-500 text-sm">{collaboratorsError}</p>
              ) : Array.isArray(sharedUsers) && sharedUsers.length > 0 ? (
                <ul className="space-y-2">
                  {sharedUsers.map(
                    (user: SharedUser) =>
                      user.id !== currentUser.id && (
                        <SharedUserCard
                          key={user.id}
                          user={user}
                          canRemove={canShare}
                          onRemove={handleRemoveUser}
                          isRemoving={removingCollaborator}
                        />
                      )
                  )}
                </ul>
              ) : (
                <p className="text-gray-500">
                  No users shared with this document yet.
                </p>
              )}
              {removeError && (
                <p className="text-red-500 text-sm mt-2">{removeError}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareComponent;
