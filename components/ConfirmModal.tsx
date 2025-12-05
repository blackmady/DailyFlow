import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  type: 'confirm' | 'alert';
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, type, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs overflow-hidden flex flex-col transform transition-all scale-100">
        <div className="p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="flex border-t border-gray-100 bg-gray-50/50">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors border-r border-gray-100"
            >
              取消
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3.5 text-sm font-medium transition-colors ${
              type === 'confirm' 
                ? 'text-primary-600 hover:bg-primary-50 active:bg-primary-100 font-semibold' 
                : 'text-primary-600 hover:bg-gray-100 active:bg-gray-200 font-bold w-full'
            }`}
          >
            {type === 'confirm' ? '确定' : '知道了'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;