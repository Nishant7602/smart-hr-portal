import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicantsAPI, interviewsAPI } from '../services/api';
import { PageHeader, StatusBadge, Loading, EmptyState, Modal, Pagination } from '../components/common/Common';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['', 'APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'ASSESSMENT', 'OFFERED', 'REJECTED', 'WITHDRAWN'];

// ─── Applicants List ──────────────────────────────────────────────────────────
export default function ApplicantsPage() {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  // We load all applicants — for a real app you'd have a global endpoint
  useEffect(() => {
    setLoading(true);
    // Fetch from all jobs — simplified: load applicants without job filter
    applicantsAPI.getByJob(1, { page, size: 20, status: filterStatus })
      .then(r => { setApplicants(r.data.content || []); setTotalPages(r.data.totalPages || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filterStatus]);

  return (
    <>
      <PageHeader title="All Applicants" subtitle="Manage and review candidates across all jobs" />
      <div className="page-body">
        <div className="filters-bar">
          <select className="form-select" style={{ width: 180 }} value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(0); }}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
        </div>
        {loading ? <Loading /> : applicants.length === 0 ? (
          <EmptyState icon="👥" title="No Applicants" message="Applicants will appear here once candidates apply." />
        ) : (
          <>
            <div className="card">
              <div className="table-wrapper">
                <table>
                  <thead><tr>
                    <th>Candidate</th><th>Job</th><th>Status</th>
                    <th>AI Score</th><th>Applied</th><th></th>
                  </tr></thead>
                  <tbody>
                    {applicants.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                              {(a.firstName[0] + a.lastName[0]).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{a.firstName} {a.lastName}</div>
                              <div className="text-sm text-gray">{a.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-gray" style={{ fontSize: 13 }}>{a.jobTitle}</td>
                        <td><StatusBadge status={a.status} /></td>
                        <td>
                          {a.aiScore != null ? (
                            <span style={{
                              fontWeight: 700,
                              color: a.aiScore >= 70 ? 'var(--success)' : a.aiScore >= 40 ? 'var(--warning)' : 'var(--danger)'
                            }}>{a.aiScore}/100</span>
                          ) : <span className="text-gray">Not screened</span>}
                        </td>
                        <td className="text-gray" style={{ fontSize: 12 }}>
                          {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/applicants/${a.id}`)}>
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}

// ─── Applicant Detail ─────────────────────────────────────────────────────────
export function ApplicantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screening, setScreening] = useState(false);
  const [tab, setTab] = useState('profile');
  const [scheduleModal, setScheduleModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const [aRes, iRes] = await Promise.all([
        applicantsAPI.getById(id),
        interviewsAPI.getByApplicant(id),
      ]);
      setApplicant(aRes.data.data);
      setInterviews(iRes.data || []);
    } catch { toast.error('Failed to load applicant'); navigate('/applicants'); }
    finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleScreen = async () => {
    setScreening(true);
    try {
      const res = await applicantsAPI.screen(id);
      setApplicant(res.data.data);
      toast.success('AI screening complete!');
      setTab('ai');
    } catch (e) { toast.error(e.response?.data?.message || 'Screening failed'); }
    finally { setScreening(false); }
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await applicantsAPI.updateStatus(id, status);
      setApplicant(res.data.data);
      toast.success('Status updated');
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <><PageHeader title="Loading…" /><div className="page-body"><Loading /></div></>;
  if (!applicant) return null;

  return (
    <>
      <PageHeader
        title={`${applicant.firstName} ${applicant.lastName}`}
        subtitle={`Applied for: ${applicant.jobTitle}`}
        actions={
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
            <button className="btn btn-primary btn-sm" onClick={handleScreen} disabled={screening}>
              {screening ? '🤖 Screening…' : '🤖 AI Screen Resume'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => setScheduleModal(true)}>
              📅 Schedule Interview
            </button>
          </div>
        }
      />
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div className="avatar lg" style={{ margin: '0 auto 12px' }}>
                  {(applicant.firstName[0] + applicant.lastName[0]).toUpperCase()}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{applicant.firstName} {applicant.lastName}</div>
                <div className="text-sm text-gray" style={{ marginBottom: 12 }}>{applicant.email}</div>
                <StatusBadge status={applicant.status} />
                {applicant.aiScore != null && (
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      border: `4px solid ${applicant.aiScore >= 70 ? 'var(--success)' : applicant.aiScore >= 40 ? 'var(--warning)' : 'var(--danger)'}`,
                      display: 'grid', placeItems: 'center',
                      color: applicant.aiScore >= 70 ? 'var(--success)' : applicant.aiScore >= 40 ? 'var(--warning)' : 'var(--danger)',
                      fontWeight: 800, fontSize: 18
                    }}>{applicant.aiScore}</div>
                  </div>
                )}
                {applicant.aiScore != null && <div className="text-sm text-gray" style={{ marginTop: 6 }}>AI Fit Score</div>}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><div className="card-title">Update Status</div></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'].map(s => (
                  <button key={s} className={`btn btn-sm ${applicant.status === s ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handleStatusChange(s)} style={{ justifyContent: 'flex-start' }}>
                    {s === 'SHORTLISTED' ? '✅' : s === 'INTERVIEW' ? '📅' : s === 'OFFERED' ? '🎉' : '❌'} {s}
                  </button>
                ))}
              </div>
            </div>

            {(applicant.phone || applicant.linkedinUrl) && (
              <div className="card">
                <div className="card-header"><div className="card-title">Contact</div></div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  {applicant.phone && <div>📱 {applicant.phone}</div>}
                  {applicant.linkedinUrl && <a href={applicant.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>🔗 LinkedIn Profile</a>}
                  {applicant.portfolioUrl && <a href={applicant.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>🌐 Portfolio</a>}
                  {applicant.resumeUrl && <a href={applicant.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: 4 }}>📄 Download Resume</a>}
                </div>
              </div>
            )}
          </div>

          {/* Main */}
          <div>
            <div className="tabs">
              {['profile', 'ai', 'interviews'].map(t => (
                <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                  {t === 'profile' ? '👤 Profile' : t === 'ai' ? '🤖 AI Analysis' : `📅 Interviews (${interviews.length})`}
                </button>
              ))}
            </div>

            {tab === 'profile' && (
              <div className="card">
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {applicant.coverLetter && <>
                    <div>
                      <h4 style={{ marginBottom: 8 }}>Cover Letter</h4>
                      <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{applicant.coverLetter}</p>
                    </div>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)' }} />
                  </>}
                  <div>
                    <h4 style={{ marginBottom: 8 }}>Applied For</h4>
                    <p style={{ color: 'var(--gray-600)' }}>{applicant.jobTitle}</p>
                  </div>
                  <div>
                    <h4 style={{ marginBottom: 8 }}>Application Date</h4>
                    <p style={{ color: 'var(--gray-600)' }}>{applicant.appliedAt ? new Date(applicant.appliedAt).toLocaleString() : '—'}</p>
                  </div>
                </div>
              </div>
            )}

            {tab === 'ai' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {!applicant.aiScreeningSummary ? (
                  <div className="card"><div className="card-body">
                    <div className="empty-state">
                      <div className="icon">🤖</div>
                      <h3>No AI Analysis Yet</h3>
                      <p>Click "AI Screen Resume" to analyze this candidate with Claude AI.</p>
                      <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleScreen} disabled={screening}>
                        {screening ? 'Screening…' : '🤖 Run AI Screening'}
                      </button>
                    </div>
                  </div></div>
                ) : (
                  <>
                    <div className="card">
                      <div className="card-header">
                        <div className="card-title">AI Screening Summary</div>
                        <span className="ai-badge">✨ Claude AI</span>
                      </div>
                      <div className="card-body">
                        <div className="ai-output">{applicant.aiScreeningSummary}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {applicant.aiStrengths && (
                        <div className="card">
                          <div className="card-header"><div className="card-title">✅ Strengths</div></div>
                          <div className="card-body">
                            {applicant.aiStrengths.split(';').map((s, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                                <span style={{ color: 'var(--success)', flexShrink: 0 }}>●</span>
                                <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>{s.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {applicant.aiGaps && (
                        <div className="card">
                          <div className="card-header"><div className="card-title">⚠️ Gaps</div></div>
                          <div className="card-body">
                            {applicant.aiGaps.split(';').map((g, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                                <span style={{ color: 'var(--warning)', flexShrink: 0 }}>●</span>
                                <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>{g.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === 'interviews' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {interviews.length === 0 ? (
                  <div className="card"><div className="card-body">
                    <div className="empty-state">
                      <div className="icon">📅</div><h3>No Interviews Scheduled</h3>
                      <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setScheduleModal(true)}>
                        Schedule Interview
                      </button>
                    </div>
                  </div></div>
                ) : interviews.map(i => (
                  <div key={i.id} className="card">
                    <div className="card-body">
                      <div className="flex items-center justify-between">
                        <div>
                          <div style={{ fontWeight: 600 }}>Round {i.round} — {i.type?.replace(/_/g, ' ')}</div>
                          <div className="text-sm text-gray">
                            {new Date(i.scheduledAt).toLocaleString()} · {i.durationMinutes} min
                          </div>
                          {i.interviewerName && <div className="text-sm text-gray">👤 {i.interviewerName}</div>}
                        </div>
                        <StatusBadge status={i.status} />
                      </div>
                      {i.feedback && (
                        <div className="ai-output" style={{ marginTop: 12, background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                          <strong>Feedback:</strong> {i.feedback}
                          {i.rating && <span style={{ marginLeft: 10 }}>⭐ {i.rating}/5</span>}
                          {i.recommendation && <span style={{ marginLeft: 10 }} className={`badge ${i.recommendation.includes('YES') ? 'badge-green' : 'badge-red'}`}>{i.recommendation}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {scheduleModal && (
        <ScheduleInterviewModal applicantId={id} onClose={() => setScheduleModal(false)}
          onScheduled={() => { setScheduleModal(false); load(); toast.success('Interview scheduled!'); }} />
      )}
    </>
  );
}

function ScheduleInterviewModal({ applicantId, onClose, onScheduled }) {
  const [form, setForm] = useState({
    applicantId: Number(applicantId), scheduledAt: '', durationMinutes: 60,
    type: 'VIDEO', interviewerName: '', interviewerEmail: '', meetingLink: '', round: 1,
  });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.scheduledAt) { toast.error('Please select a date and time'); return; }
    setLoading(true);
    try {
      await interviewsAPI.schedule({ ...form, scheduledAt: new Date(form.scheduledAt).toISOString() });
      onScheduled();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to schedule'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="📅 Schedule Interview" onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Scheduling…' : 'Schedule Interview'}
        </button>
      </>}>
      <div className="form-grid form-grid-2">
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Date & Time <span className="required">*</span></label>
          <input className="form-input" type="datetime-local" value={form.scheduledAt} onChange={set('scheduledAt')} />
        </div>
        <div className="form-group">
          <label className="form-label">Interview Type</label>
          <select className="form-select" value={form.type} onChange={set('type')}>
            {['PHONE_SCREEN', 'VIDEO', 'IN_PERSON', 'TECHNICAL', 'HR', 'PANEL'].map(t =>
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Duration (minutes)</label>
          <input className="form-input" type="number" value={form.durationMinutes} onChange={set('durationMinutes')} />
        </div>
        <div className="form-group">
          <label className="form-label">Interviewer Name</label>
          <input className="form-input" value={form.interviewerName} onChange={set('interviewerName')} />
        </div>
        <div className="form-group">
          <label className="form-label">Round</label>
          <input className="form-input" type="number" min="1" value={form.round} onChange={set('round')} />
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Meeting Link</label>
          <input className="form-input" value={form.meetingLink} onChange={set('meetingLink')} placeholder="https://meet.google.com/…" />
        </div>
      </div>
    </Modal>
  );
}
