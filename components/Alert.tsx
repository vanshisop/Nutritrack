import React from 'react';

type AlertProps = {
  type: string;
  message: string;
  onClose: () => void;
};

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  let alertStyles;
  let alertIcon;

  switch (type) {
    case 'success':
      alertStyles = 'bg-green-500 text-white';
      alertIcon = '✔️';
      break;
    case 'error':
      alertStyles = 'bg-red-500 text-white';
      alertIcon = '❌';
      break;
    case 'info':
      alertStyles = 'bg-blue-500 text-white';
      alertIcon = 'ℹ️';
      break;
    case 'warning':
      alertStyles = 'bg-yellow-500 text-white';
      alertIcon = '⚠️';
      break;
    default:
      alertStyles = 'bg-gray-500 text-white';
      alertIcon = '❗';
  }

  return (
    <div className={`flex items-center p-4 rounded ${alertStyles}`} role="alert">
      <span className="mr-2">{alertIcon}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-auto bg-transparent border-0 text-white"
        aria-label="Close"
      >
        ✖️
      </button>
    </div>
  );
};

export default Alert;
