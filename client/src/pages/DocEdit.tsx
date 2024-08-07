import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useGetDocument } from "../hooks/useDocs";
import { currentDocState, userState } from "../atom";
import DocEditorSkeleton from "../components/DocEditorSkeleton";
import { useCustomYjsCollaboration } from "../hooks/useYjsCollaboration";
import SummaryCard from "../components/SummaryCard";
import EditHeader from "../components/EditHeader";

const DocEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getDocument, loading } = useGetDocument();
  const [currentDoc, setCurrentDoc] = useRecoilState(currentDocState);
  const user = useRecoilValue(userState);
  const [docNotFound, setDocNotFound] = useState(false);
  const quillRef = useRef<ReactQuill>(null);

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
      const ytext = getYText();
      if (ytext) {
        const delta = quillRef.current?.getEditor().getContents();
        console.log(delta);
        ytext.delete(0, ytext.length);
        ytext.insert(0, content);
        setCurrentDoc((prev) => ({ ...prev, content }));
      }
    },
    [getYText, setCurrentDoc]
  );

  useEffect(() => {
    if (isConnected && quillRef.current) {
      const ytext = getYText();
      if (ytext) {
        const quill = quillRef.current.getEditor();
        quill.setText(ytext.toString());

        ytext.observe(() => {
          quill.setText(ytext.toString());
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
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar for summary and comments */}
      <div className="w-1/4 p-4 bg-white shadow-md overflow-y-auto">
        <SummaryCard />
        <div className="h-0.5 bg-slate-200 my-3 rounded-full w-full" />
      </div>

      {/* Main content area */}
      <div className="flex-grow flex flex-col p-6">
        <EditHeader />
        <div className="flex-grow bg-white rounded-lg shadow-lg overflow-hidden relative">
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
    </div>
  );
};

export default DocEditor;
