"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Função para adicionar um toast (remove automaticamente após 3 segundos)
  const addToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200); // Um pouco mais que o tempo de animação
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Container dos Toasts - Flutuante e minimalista */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-4 px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-xl transition-all duration-300 animate-slide-in"
            style={{
              animation: 'toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div className="flex items-center gap-3">
              {/* Indicador visual com o roxo principal */}
              <span 
                className={`h-2 w-2 rounded-full shrink-0 ${
                  toast.type === 'error' ? 'bg-red-500' : 'bg-[var(--primary)]'
                }`} 
              />
              <p className="text-sm font-medium text-[var(--foreground)]">
                {toast.message}
              </p>
            </div>
            
            {/* Botão de Fechar discreto */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[var(--muted)] hover:text-[var(--foreground)] text-xs p-1 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Estilo embutido temporário para a animação de entrada do Toast */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

// Hook personalizado para facilitar o uso nos componentes
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
}