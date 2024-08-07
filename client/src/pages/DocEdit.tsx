import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useGetDocument } from "../hooks/useDocs";
import { currentDocState, userState } from "../atom";
import DocEditorSkeleton from "../components/DocEditorSkeleton";
import ShareComponent from "../components/ShareDoc";
import { useCustomYjsCollaboration } from "../hooks/useYjsCollaboration";

const DocEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getDocument, loading } = useGetDocument();
  const [currentDoc, setCurrentDoc] = useRecoilState(currentDocState);
  const user = useRecoilValue(userState);
  const [docNotFound, setDocNotFound] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  const isLocalChange = useRef(false);

  const { isConnected, error, getYText } = useCustomYjsCollaboration(
    user.id,
    id || ""
  );

  useEffect(() => {
    const loadDocument = async () => {
      if (id) {
        try {
          const doc = await getDocument(id);
          if (doc) {
            setCurrentDoc(doc);
          } else {
            setDocNotFound(true);
          }
        } catch (error) {
          console.error("Error loading document:", error);
          setDocNotFound(true);
        }
      }
    };

    loadDocument();
  }, [id, getDocument, setCurrentDoc]);

  const handleContentChange = useCallback(
    (content: string) => {
      if (isLocalChange.current) return;
      isLocalChange.current = true;
      const ytext = getYText();
      if (ytext) {
        ytext.delete(0, ytext.length);
        ytext.insert(0, content);
        setCurrentDoc((prev) => ({ ...prev, content }));
      }
      isLocalChange.current = false;
    },
    [getYText, setCurrentDoc]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDoc((prev) => ({ ...prev, title: e.target.value }));
    // Here you would typically save the document title
    // For example: saveDocumentTitle(e.target.value);
  };

  useEffect(() => {
    if (isConnected && quillRef.current) {
      const ytext = getYText();
      if (ytext) {
        const quill = quillRef.current.getEditor();

        // Initial sync
        quill.setText(ytext.toString());

        // Listen for remote changes
        ytext.observe(() => {
          if (!isLocalChange.current) {
            isLocalChange.current = true;
            quill.setText(ytext.toString());
            isLocalChange.current = false;
          }
        });
      }
    }
  }, [isConnected, getYText]);

  if (loading) {
    return <DocEditorSkeleton />;
  }

  if (docNotFound) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Document Not Found
          </h2>
          <p className="text-gray-600">
            The document you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isConnected) {
    return <div>Connecting to collaborative session...</div>;
  }

  return (
    <div className="flex flex-col bg-gray-100 p-6 h-screen">
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          value={currentDoc?.title || ""}
          onChange={handleTitleChange}
          className="text-3xl font-bold py-2 px-4 bg-transparent border-b-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors duration-300 w-full mr-4"
          placeholder="Document Title"
        />
        <div className="flex items-center space-x-4">
          <ShareComponent />
        </div>
      </div>
      <div className="flex-grow bg-white rounded-lg shadow-lg overflow-hidden">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={currentDoc?.content || ""}
          onChange={handleContentChange}
          className="h-full"
          modules={{
            toolbar: [
              [{ header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike", "blockquote"],
              [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
              ],
              ["link", "image"],
              ["clean"],
            ],
          }}
        />
      </div>
    </div>
  );
};

export default DocEditor;
