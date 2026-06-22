import { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastListeners: ((t: Toast) => void)[] = [];
let toastCounter = 0;

export function showToast(message: string, type: Toast['type'] = 'info') {
  const toast: Toast = { id: String(++toastCounter), message, type };
  toastListeners.forEach(l => l(toast));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    const listener = (t: Toast) => setToasts(prev => [...prev.slice(-2), t]);
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter(l => l !== listener); };
  }, []);
  useEffect(() => {
    if (toasts.length === 0) return;
    const t = toasts[toasts.length - 1];
    const timer = setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4500);
    return () => clearTimeout(timer);
  }, [toasts]);
  return toasts;
}
