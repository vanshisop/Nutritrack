import React from 'react';

// Define the types for the props
interface ProgressBarProps {
  progress: number; // progress is a number representing the percentage (0-100)
  className?: string; // className is an optional string for custom styles
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className }) => {
  return (
    <div className={`relative ${className}`}>
      <div
        style={{ width: `${progress}%` }}
        className="h-full bg-green-500 rounded-full"
      />
    </div>
  );
};

export default ProgressBar;
