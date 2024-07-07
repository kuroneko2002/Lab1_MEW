import React from 'react';

export default function FileUploadPopup({ isOpen, onClose, onFileUpload }) {
    if (!isOpen) return null;

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onFileUpload(file);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="flex flex-col items-center justify-center bg-white p-10 pt-5 rounded-lg">
                <h2 className="text-2xl mx-5 my-3">Upload your key here</h2>
                <input type="file" accept=".txt" onChange={handleFileChange} className='my-5' placeholder='Upload your key here'/>
                <button className="mt-4 p-2 bg-red-500 text-white rounded" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};
