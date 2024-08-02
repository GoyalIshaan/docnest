import React from "react";

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm h-full">
    <div className="flex items-center mb-4">
      <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
    </div>
    <div className="space-y-3 flex-grow">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
    <div className="mt-6 flex justify-between items-center">
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
    </div>
  </div>
);

const DocsSkeletonLoader: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="h-12 bg-gray-200 rounded w-40"></div>
      </div>
      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
};

export default DocsSkeletonLoader;
