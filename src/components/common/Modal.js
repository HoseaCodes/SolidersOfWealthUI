import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal container with padding */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal content */}
        <div className="relative bg-gray-900 rounded-lg w-full max-w-4xl z-50">
          {/* Header - fixed */}
          <div className="sticky top-0 bg-gray-900 flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white military-header">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
          
          {/* Content - scrollable */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
