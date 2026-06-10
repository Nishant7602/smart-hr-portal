import React from 'react';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="top-bar">
      <div>
        <div className="page-title">{title}</div>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Spinner({ size = 18 }) {
  return (
    <div className="spinner" style={{ width: size, height: size }} />
  );
}

export function Loading({ text = 'Loading...' }) {
  return (
    <div className="ai-loading" style={{ justifyContent: 'center', padding: 40 }}>
      <Spinner size={24} /><span>{text}</span>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    // Job statuses
    OPEN: 'badge-green', DRAFT: 'badge-gray', CLOSED: 'badge-red', ON_HOLD: 'badge-yellow',
    // Applicant statuses
    APPLIED: 'badge-blue', SCREENING: 'badge-yellow', SHORTLISTED: 'badge-green',
    INTERVIEW: 'badge-purple', ASSESSMENT: 'badge-cyan', OFFERED: 'badge-green',
    REJECTED: 'badge-red', WITHDRAWN: 'badge-gray',
    // Interview statuses
    SCHEDULED: 'badge-blue', CONFIRMED: 'badge-green', COMPLETED: 'badge-green',
    CANCELLED: 'badge-red', NO_SHOW: 'badge-red', RESCHEDULED: 'badge-yellow',
  };
  return (
    <span className={`badge ${map[status] || 'badge-gray'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

export function AIScoreRing({ score }) {
  if (score == null) return <span className="text-gray text-sm">—</span>;
  const cls = score >= 70 ? 'score-high' : score >= 40 ? 'score-mid' : 'score-low';
  return <div className={`score-ring ${cls}`}>{score}</div>;
}

export function Modal({ title, onClose, children, footer, size = '' }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({ title, message, onConfirm, onClose, danger = false }) {
  return (
    <Modal title={title} onClose={onClose} footer={
      <>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
          Confirm
        </button>
      </>
    }>
      <p style={{ color: 'var(--gray-600)' }}>{message}</p>
    </Modal>
  );
}

export function EmptyState({ icon = '📭', title, message, action }) {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

export function SelectField({ label, required, value, onChange, options, placeholder }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}{required && <span className="required"> *</span>}</label>}
      <select className="form-select" value={value} onChange={e => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2" style={{ justifyContent: 'center', padding: '16px 0' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => onChange(page - 1)} disabled={page === 0}>
        ← Prev
      </button>
      <span className="text-sm text-gray">Page {page + 1} of {totalPages}</span>
      <button className="btn btn-secondary btn-sm" onClick={() => onChange(page + 1)} disabled={page === totalPages - 1}>
        Next →
      </button>
    </div>
  );
}
