import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Style helpers                                                      */
/* ------------------------------------------------------------------ */

const accentMap: Record<ToastType, string> = {
  success: '#10b981',
  error: '#ef4444',
  info: 'var(--primary, #6366f1)',
};

const iconMap: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
};

/* ------------------------------------------------------------------ */
/*  ToastItem                                                          */
/* ------------------------------------------------------------------ */

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const accent = accentMap[toast.type];

  return (
    <motion.div
      layout
      initial={{ y: -80, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -80, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={() => onDismiss(toast.id)}
      style={{
        direction: 'rtl',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 18px',
        borderRadius: 14,
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.10), inset 0 0 0 1px rgba(255,255,255,0.45)`,
        borderRight: `4px solid ${accent}`,
        cursor: 'pointer',
        maxWidth: 380,
        width: 'calc(100vw - 32px)',
        pointerEvents: 'auto',
      }}
    >
      <span
        className="material-symbols-outlined fill-1"
        style={{ fontSize: 22, color: accent, flexShrink: 0 }}
      >
        {iconMap[toast.type]}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#1e293b',
          lineHeight: 1.5,
        }}
      >
        {toast.message}
      </span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 3000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container - fixed at top center */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
