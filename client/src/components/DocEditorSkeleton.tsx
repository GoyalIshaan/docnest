import React from "react";

const DocEditorSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-2/3 h-10 bg-gray-200 rounded"></div>
        <div className="w-24 h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="flex-grow bg-white border border-gray-200 rounded shadow-lg overflow-hidden p-4">
        <div className="mb-4">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="h-full bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default DocEditorSkeleton;
