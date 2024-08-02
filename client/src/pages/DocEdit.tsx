import React, { useState, useEffect, useCallback } from "react";
import { EditorState, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { useParams } from "react-router-dom";
import { useGetDocument } from "../hooks/useDocs";
import DocEditorSkeleton from "../components/DocEditorSkeleton";
import { useRecoilState } from "recoil";
import { currentDocState } from "../atom";
import { Save } from "lucide-react";
import ShareComponent from "../components/ShareDoc";

const DocEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getDocument, loading } = useGetDocument();
  const [currentDoc, setCurrentDoc] = useRecoilState(currentDocState);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [docNotFound, setDocNotFound] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      if (id) {
        try {
          const doc = await getDocument(id);
          if (doc) {
            setCurrentDoc(doc);
            if (doc.content) {
              const contentState = ContentState.createFromText(doc.content);
              setEditorState(EditorState.createWithContent(contentState));
            }
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

  const onEditorStateChange = useCallback(
    (newEditorState: EditorState) => {
      setEditorState(newEditorState);
      const content = newEditorState.getCurrentContent().getPlainText();
      setCurrentDoc((prev) => ({ ...prev, content }));
    },
    [setCurrentDoc]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setCurrentDoc((prev) => ({ ...prev, title: newTitle }));
    },
    [setCurrentDoc]
  );

  const handleSave = () => {
    console.log("Saving document:", currentDoc);
    // Implement your save logic here
  };

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

  return (
    <div className="flex flex-col bg-gray-100 p-6 h-screen">
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          value={currentDoc.title}
          onChange={handleTitleChange}
          className="text-3xl font-bold py-2 px-4 bg-transparent border-b-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors duration-300 w-full mr-4"
          placeholder="Document Title"
        />
        <div className="flex items-center space-x-4">
          <ShareComponent />
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            Save
          </button>
        </div>
      </div>
      <div className="flex-grow bg-white rounded-lg shadow-lg overflow-hidden">
        <Editor
          editorState={editorState}
          onEditorStateChange={onEditorStateChange}
          wrapperClassName="h-full"
          editorClassName="h-full px-6 py-4"
          toolbarClassName="border-b border-gray-200"
          toolbar={{
            options: [
              "inline",
              "blockType",
              "fontSize",
              "fontFamily",
              "list",
              "textAlign",
              "colorPicker",
              "link",
              "embedded",
              "emoji",
              "image",
              "remove",
              "history",
            ],
          }}
        />
      </div>
    </div>
  );
};

export default DocEditor;
