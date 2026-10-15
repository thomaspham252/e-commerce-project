import { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

/** Hộp thoại đơn giản dùng chung. Đóng bằng nút X, phím Esc hoặc bấm ra ngoài. */
export const Modal = ({ isOpen, title, onClose, children, footer, width = 560 }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="app-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="app-modal" style={{ maxWidth: width }} role="dialog" aria-modal="true">
        <div className="app-modal-header">
          <h3>{title}</h3>
          <button type="button" className="app-modal-close" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>
        <div className="app-modal-body">{children}</div>
        {footer && <div className="app-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
