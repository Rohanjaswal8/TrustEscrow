import React from 'react';

const LoadingSkeleton = ({ type = 'default' }) => {
  const getSkeletonType = () => {
    switch (type) {
      case 'card':
        return (
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        );
      case 'table-row':
        return (
          <div className="animate-pulse flex space-x-4 p-4">
            <div className="h-4 bg-gray-200 rounded w-1/12"></div>
            <div className="h-4 bg-gray-200 rounded w-2/12"></div>
            <div className="h-4 bg-gray-200 rounded w-3/12"></div>
            <div className="h-4 bg-gray-200 rounded w-2/12"></div>
            <div className="h-4 bg-gray-200 rounded w-2/12"></div>
          </div>
        );
      case 'stats':
        return (
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        );
      default:
        return (
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return getSkeletonType();
};

export default LoadingSkeleton; 