import { useToast } from '../context/ToastContext';

const icon: Record<string, string> = { success: '✓', error: '✕', info: 'ℹ' };

export default function ToastHost() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => dismiss(t.id)}>
          <span className="toast-ic">{icon[t.type]}</span>
          <span className="toast-text">{t.text}</span>
        </div>
      ))}
    </div>
  );
}
