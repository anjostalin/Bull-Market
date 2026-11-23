import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';
export interface ToastItem { id: number; type: ToastType; text: string; }

interface ToastContextShape {
  toasts: ToastItem[];
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextShape>({} as ToastContextShape);

let nextId = 1;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type: ToastType, text: string) => {
    const id = nextId++;
    setToasts((list) => [...list, { id, type, text }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  const value: ToastContextShape = {
    toasts,
    success: (t) => push('success', t),
    error: (t) => push('error', t),
    info: (t) => push('info', t),
    dismiss,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => useContext(ToastContext);
