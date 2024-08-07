import { Save } from "lucide-react";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { currentDocState } from "../atom";
import { useUpdateSummary } from "../hooks/useDocs";

const SummaryCard = () => {
  const [editingSummary, setEditingSummary] = useState(false);
  const [currentDoc, setCurrentDoc] = useRecoilState(currentDocState);
  const { updateSummary, loading: updatingSummary } = useUpdateSummary();

  const saveSummary = async () => {
    await updateSummary(currentDoc.id);
    setEditingSummary(false);
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditingSummary(true);
    setCurrentDoc((prev) => ({ ...prev, summary: e.target.value }));
  };
  return (
    <>
      <h3 className="text-2xl font-bold py-2 text-slate-700 mt-4 mb-4">
        Summary
      </h3>
      <textarea
        value={currentDoc?.summary || ""}
        onChange={handleSummaryChange}
        className="w-full h-64 p-2 border bg-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-slate-200"
        placeholder="Write a brief summary..."
      />
      {editingSummary && (
        <button
          onClick={saveSummary}
          className="px-6 py-2 my-2 bg-blue-500 w-full text-center justify-center text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 "
        >
          {!updatingSummary ? (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Summary
            </>
          ) : (
            <>Updating....</>
          )}
        </button>
      )}
    </>
  );
};

export default SummaryCard;
