import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useGetDocument } from "../hooks/useDocs";
import { currentDocState, userState } from "../atom";
import DocEditorSkeleton from "../components/DocEditorSkeleton";
import { useCustomYjsCollaboration } from "../hooks/useYjsCollaboration";
import EditHeader from "../components/EditHeader";
import SideBar from "../components/SideBar";
import DocNotFoundCard from "../components/DocNotFoundCard";

const DocEditor: React.FC = () => {
  const { id: documentId } = useParams<{ id: string }>();
  const { getDocument, loading } = useGetDocument();
  const [currentDoc, setCurrentDoc] = useRecoilState(currentDocState);
  const userId = useRef<string>(useRecoilValue(userState).id);
  const [docNotFound, setDocNotFound] = useState<boolean>(false);
  const quillRef = useRef<ReactQuill>(null);

  if (!documentId) {
    throw new Error("DocumentId not found");
  }

  const { isConnected, error, getYText, updateYText } =
    useCustomYjsCollaboration(userId.current, documentId);

  useEffect(() => {
    const loadDocument = async () => {
      if (documentId) {
        try {
          const doc = await getDocument(documentId);
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
  }, [documentId, getDocument, setCurrentDoc]);

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

  const handleContentChange = useCallback(
    (content: string) => {
      updateYText(content);
    },
    [updateYText]
  );

  if (loading) {
    return <DocEditorSkeleton />;
  }

  if (docNotFound) {
    return <DocNotFoundCard />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isConnected) {
    return <div>Connecting to collaborative session...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar />
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
