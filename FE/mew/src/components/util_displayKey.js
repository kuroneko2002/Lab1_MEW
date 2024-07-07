import React from 'react';

const DisplayKey = ({ publicKey }) => {
  const truncatedString = publicKey ? `${publicKey.slice(0, 5)}...${publicKey.slice(-5)}` : 'null';

  const handleCopy = () => {
    navigator.clipboard.writeText(publicKey).then(() => {
      alert('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="border-2 p-2 border-blue-600 font-mono">{truncatedString}</div>
      <button onClick={handleCopy} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-800 transition duration-300 ease-in-out">
        Copy
      </button>
    </div>
  );
};

export default DisplayKey;
