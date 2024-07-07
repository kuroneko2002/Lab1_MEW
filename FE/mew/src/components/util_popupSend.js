import React, { useState } from 'react';

export default function SendPopup ({ isOpen, onClose, onSubmit }) {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(address, amount);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="w-3/4 bg-white p-6 rounded shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Send Funds</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
