import React from 'react';
import { X } from 'lucide-react';
import Login from './Login';
import Register from './Register';

export const AuthModal = ({ isOpen, onClose, mode }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-lg w-full max-w-md mx-auto animate-modalFade">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {mode === 'login' ? (
          <Login isModal onClose={onClose} />
        ) : (
          <Register isModal onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
