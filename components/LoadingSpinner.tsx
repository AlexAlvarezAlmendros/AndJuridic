
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      <p className="ml-4 text-slate-600 text-lg">Buscando...</p>
    </div>
  );
};

export default LoadingSpinner;
