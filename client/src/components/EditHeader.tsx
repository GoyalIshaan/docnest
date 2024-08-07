import { useState } from "react";
import ShareComponent from "../components/ShareDoc";
import { Save } from "lucide-react";
import { useUpdateTitle } from "../hooks/useDocs";
import { useRecoilState } from "recoil";
import { currentDocState } from "../atom";
const EditHeader = () => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [currentDoc, setCurrentDoc] = useRecoilState(currentDocState);
  const { updateTitle, loading: updatingTitle } = useUpdateTitle();
  const saveTitle = async () => {
    await updateTitle(currentDoc.id);
    setEditingTitle(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(true);
    setCurrentDoc((prev) => ({ ...prev, title: e.target.value }));
  };

  return (
    <div className="flex items-center justify-between mb-3">
      <input
        type="text"
        value={currentDoc?.title || ""}
        onChange={handleTitleChange}
        className="text-3xl font-bold py-2 px-2 bg-transparent border-b-2 border-transparent focus:border-blue-500 focus:outline-none transition-colors duration-300 w-full mr-4"
        placeholder="Document Title"
      />
      <div className="flex items-center space-x-4">
        {editingTitle && (
          <button
            onClick={saveTitle}
            disabled={updatingTitle}
            className="px-6 py-3.5 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            Save
          </button>
        )}
        <ShareComponent />
      </div>
    </div>
  );
};

export default EditHeader;
