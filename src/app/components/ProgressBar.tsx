'use client';

import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div style={{ marginTop: '1rem' }}>
      <p>Extracting frames... {progress}%</p>
      <progress value={progress} max={100} style={{ width: '100%' }} />
    </div>
  );
};

export default ProgressBar;