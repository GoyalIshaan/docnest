import React, { useEffect, useState } from "react";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import DocCard from "../components/DocCard";
import {
  useCreateDoc,
  useGetUserDocs,
  useDeleteDoc,
  useGetSharedDocs,
} from "../hooks/useDocs";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { docsState, sharedDocsState } from "../atom";
import DocsSkeletonLoader from "../components/DocsPageSkeleton";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const UseDocs: React.FC = () => {
  const { getUserDocs, loading, error } = useGetUserDocs();
  const {
    getSharedDocs,
    loading: sharedLoading,
    error: sharedError,
  } = useGetSharedDocs();
  const {
    createDoc,
    loading: createLoading,
    error: createError,
  } = useCreateDoc();
  const {
    deleteDoc,
    loading: deleteLoading,
    error: deleteError,
  } = useDeleteDoc();
  const docs = useRecoilValue(docsState);
  const sharedDocs = useRecoilValue(sharedDocsState);
  const setDocs = useSetRecoilState(docsState);
  const navigate = useNavigate();
  const [showCreateError, setShowCreateError] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);

  useEffect(() => {
    getUserDocs();
    getSharedDocs();
  }, [getUserDocs, getSharedDocs]);

  useEffect(() => {
    if (createError) {
      setShowCreateError(true);
      const timer = setTimeout(() => setShowCreateError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [createError]);

  useEffect(() => {
    if (deleteError) {
      setShowDeleteError(true);
      const timer = setTimeout(() => setShowDeleteError(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [deleteError]);

  const handleNewDoc = async () => {
    console.log("Creating new document");
    try {
      const doc = await createDoc();
      navigate(`/docs/${doc.id}`);
    } catch (error) {
      console.error("Failed to create document:", error);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    console.log(`Deleting document with id: ${id}`);
    try {
      await deleteDoc(id);
      setDocs(docs.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const handleSharedDocDelete = async (id: string): Promise<void> => {
    console.log(`Cannot delete shared document with id: ${id}`);
    toast.error("You cannot delete a shared document.", {
      duration: 3000,
      position: "bottom-center",
    });
  };

  if (loading || sharedLoading) {
    return <DocsSkeletonLoader />;
  }

  if (error || sharedError) {
    return (
      <div className="text-center mt-8 text-red-500">
        Error: {error || sharedError}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 h-screen overflow-auto">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Documents</h1>
        <button
          onClick={handleNewDoc}
          disabled={createLoading}
          className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Plus className="w-5 h-5 mr-2" />
          )}
          {createLoading ? "Creating..." : "New Document"}
        </button>
      </div>
      {showCreateError && (
        <div
          className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
          role="alert"
        >
          <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
          <span className="sr-only">Error</span>
          <div>
            <span className="font-medium">Creation Error:</span> {createError}
          </div>
        </div>
      )}
      {showDeleteError && (
        <div
          className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
          role="alert"
        >
          <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
          <span className="sr-only">Error</span>
          <div>
            <span className="font-medium">Deletion Error:</span> {deleteError}
          </div>
        </div>
      )}

      {docs.length === 0 ? (
        <p className="text-center text-gray-500 mb-8">
          No documents found. Create a new one to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {docs.map((doc) => (
            <DocCard
              key={doc.id}
              id={doc.id}
              title={doc.title}
              content={doc.content}
              updatedAt={doc.updatedAt}
              onDelete={handleDeleteDoc}
              isDeletingGlobal={deleteLoading}
            />
          ))}
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
        Shared with Me
      </h2>
      {sharedDocs.length === 0 ? (
        <p className="text-center text-gray-500">No shared documents found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sharedDocs.map((doc) => (
            <DocCard
              key={doc.id}
              id={doc.id}
              title={doc.title}
              content={doc.content}
              updatedAt={doc.updatedAt}
              onDelete={handleSharedDocDelete}
              isDeletingGlobal={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UseDocs;
