import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewsAPI } from '../services/api';
import { PageHeader, StatusBadge, Loading, EmptyState, Modal } from '../components/common/Common';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_ICON = { PHONE_SCREEN: '📞', VIDEO: '🎥', IN_PERSON: '🤝', TECHNICAL: '💻', HR: '👥', PANEL: '🏛️' };

export default function InterviewsPage() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('upcoming');
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [questionsModal, setQuestionsModal] = useState(null);
  const [questions, setQuestions] = useState('');
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = filterStatus === 'upcoming'
        ? await interviewsAPI.getUpcoming()
        : await interviewsAPI.getByJob(1); // simplified
      setInterviews(res.data || []);
    } catch { toast.error('Failed to load interviews'); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleFeedbackSave = async (interviewId, data) => {
    try {
      await interviewsAPI.submitFeedback(interviewId, data);
      toast.success('Feedback submitted!');
      setFeedbackModal(null);
      load();
    } catch { toast.error('Failed to submit feedback'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this interview?')) return;
    try {
      await interviewsAPI.cancel(id);
      toast.success('Interview cancelled');
      load();
    } catch { toast.error('Failed to cancel'); }
  };

  const handleGenerateQuestions = async (id) => {
    setQuestionsModal(id);
    setQuestionsLoading(true);
    setQuestions('');
    try {
      const res = await interviewsAPI.generateQuestions(id);
      setQuestions(res.data.data || '');
    } catch { toast.error('Failed to generate questions'); }
    finally { setQuestionsLoading(false); }
  };

  const upcoming = interviews.filter(i => ['SCHEDULED', 'CONFIRMED'].includes(i.status));
  const past = interviews.filter(i => ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(i.status));

  return (
    <>
      <PageHeader title="Interviews" subtitle={`${upcoming.length} upcoming · ${past.length} completed`} />
      <div className="page-body">
        <div className="filters-bar">
          {['upcoming', 'all'].map(f => (
            <button key={f} className={`btn ${filterStatus === f ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterStatus(f)}>
              {f === 'upcoming' ? '📅 Upcoming' : '📋 All'}
            </button>
          ))}
        </div>

        {loading ? <Loading /> : interviews.length === 0 ? (
          <EmptyState icon="📅" title="No Interviews" message="Schedule interviews from applicant profiles." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {interviews.map(interview => (
              <div key={interview.id} className="card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: 48, height: 48, borderRadius: 10, background: 'var(--primary-light)',
                        display: 'grid', placeItems: 'center', fontSize: 22, flexShrink: 0
                      }}>
                        {TYPE_ICON[interview.type] || '📅'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{interview.applicantName}</div>
                        <div className="text-sm text-gray">
                          {interview.jobTitle} · Round {interview.round} · {interview.type?.replace(/_/g, ' ')}
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12.5 }}>
                          <span>🗓 {format(new Date(interview.scheduledAt), 'EEE, MMM d yyyy')}</span>
                          <span>🕐 {format(new Date(interview.scheduledAt), 'HH:mm')}</span>
                          <span>⏱ {interview.durationMinutes} min</span>
                          {interview.interviewerName && <span>👤 {interview.interviewerName}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={interview.status} />
                      {interview.meetingLink && (
                        <a href={interview.meetingLink} target="_blank" rel="noreferrer"
                          className="btn btn-outline btn-sm">🔗 Join</a>
                      )}
                      {['SCHEDULED', 'CONFIRMED'].includes(interview.status) && (
                        <>
                          <button className="btn btn-secondary btn-sm"
                            onClick={() => handleGenerateQuestions(interview.id)}>
                            🤖 Questions
                          </button>
                          <button className="btn btn-primary btn-sm"
                            onClick={() => setFeedbackModal(interview)}>
                            ✍️ Feedback
                          </button>
                          <button className="btn btn-ghost btn-sm"
                            onClick={() => handleCancel(interview.id)}>
                            ✕
                          </button>
                        </>
                      )}
                      {interview.status === 'COMPLETED' && !interview.feedback && (
                        <button className="btn btn-outline btn-sm"
                          onClick={() => setFeedbackModal(interview)}>
                          Add Feedback
                        </button>
                      )}
                    </div>
                  </div>

                  {interview.feedback && (
                    <div style={{
                      marginTop: 12, padding: '10px 14px', background: 'var(--gray-50)',
                      borderRadius: 7, border: '1px solid var(--gray-200)', fontSize: 13
                    }}>
                      <strong>Feedback:</strong> {interview.feedback}
                      {interview.rating && <span style={{ marginLeft: 10 }}>⭐ {interview.rating}/5</span>}
                      {interview.recommendation && (
                        <span className={`badge ${interview.recommendation.includes('YES') ? 'badge-green' : 'badge-red'}`}
                          style={{ marginLeft: 8 }}>{interview.recommendation.replace(/_/g, ' ')}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {feedbackModal && (
        <FeedbackModal interview={feedbackModal}
          onClose={() => setFeedbackModal(null)}
          onSave={(data) => handleFeedbackSave(feedbackModal.id, data)} />
      )}

      {questionsModal && (
        <Modal title="🤖 AI Interview Questions" onClose={() => setQuestionsModal(null)} size="modal-lg"
          footer={<button className="btn btn-secondary" onClick={() => setQuestionsModal(null)}>Close</button>}>
          {questionsLoading ? (
            <div className="ai-loading"><div className="spinner" /><span>Generating tailored questions…</span></div>
          ) : (
            <div className="ai-output" style={{ whiteSpace: 'pre-wrap', maxHeight: 500, overflowY: 'auto' }}>
              {questions}
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

function FeedbackModal({ interview, onClose, onSave }) {
  const [form, setForm] = useState({
    feedback: '', rating: 3, recommendation: 'YES', status: 'COMPLETED'
  });
  const [loading, setLoading] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.feedback.trim()) { toast.error('Please enter feedback'); return; }
    setLoading(true);
    await onSave(form);
    setLoading(false);
  };

  return (
    <Modal title={`Feedback — ${interview.applicantName}`} onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Submit Feedback'}
        </button>
      </>}>
      <div className="form-group">
        <label className="form-label">Feedback <span className="required">*</span></label>
        <textarea className="form-textarea" rows={4} value={form.feedback}
          onChange={e => set('feedback')(e.target.value)}
          placeholder="Share your assessment of the candidate…" />
      </div>
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Rating (1–5)</label>
          <select className="form-select" value={form.rating} onChange={e => set('rating')(Number(e.target.value))}>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{'⭐'.repeat(n)} {n}/5</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Recommendation</label>
          <select className="form-select" value={form.recommendation} onChange={e => set('recommendation')(e.target.value)}>
            {['STRONG_YES', 'YES', 'MAYBE', 'NO', 'STRONG_NO'].map(r =>
              <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Interview Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status')(e.target.value)}>
            {['COMPLETED', 'NO_SHOW', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  );
}
