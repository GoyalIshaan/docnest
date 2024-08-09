const DocNotFoundCard = () => {
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
};

export default DocNotFoundCard;
