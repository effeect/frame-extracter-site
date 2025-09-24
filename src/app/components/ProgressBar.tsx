'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="mt-4">
      <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
        Extracting frames... {progress}%
      </p>
      <div className="w-full h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
};

export default ProgressBar;