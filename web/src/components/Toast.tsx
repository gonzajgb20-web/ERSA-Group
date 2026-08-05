import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'exito' | 'error';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type }) => {
  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        {type === 'exito' ? (
          <CheckCircle2 size={18} color="#86efac" />
        ) : (
          <AlertCircle size={18} color="#fca5a5" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};
