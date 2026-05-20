import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobsAPI, applicantsAPI } from '../services/api';
import { PageHeader, StatusBadge, Loading, Modal } from '../components/common/Common';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

// ─── Job Detail ───────────────────────────────────────────────────────────────
export function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isRecruiter, isAdmin } = useAuth();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [ranked, setRanked] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [rankLoading, setRankLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [jobRes, appRes] = await Promise.all([
          jobsAPI.getById(id),
          applicantsAPI.getByJob(id, { size: 50 }),
        ]);
        setJob(jobRes.data.data);
        setApplicants(appRes.data.content || []);
      } catch { toast.error('Failed to load job'); navigate('/jobs'); }
      finally { setLoading(false); }
    })();
  }, [id, navigate]);

  const handleRank = async () => {
    setRankLoading(true);
    try {
      const res = await applicantsAPI.getRanked(id);
      setRanked(res.data.data || []);
      setTab('ranked');
      toast.success('Candidates ranked by AI!');
    } catch { toast.error('Ranking failed'); }
    finally { setRankLoading(false); }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await jobsAPI.update(id, { status: newStatus });
      setJob(j => ({ ...j, status: newStatus }));
      toast.success('Job status updated');
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <><PageHeader title="Loading…" /><div className="page-body"><Loading /></div></>;
  if (!job) return null;

  return (
    <>
      <PageHeader
        title={job.title}
        subtitle={`${job.department} · ${job.location || 'Remote'}`}
        actions={
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => navigate('/jobs')}>← Back</button>
            <button className="btn btn-primary" onClick={handleRank} disabled={rankLoading}>
              {rankLoading ? '🤖 Ranking…' : '🤖 AI Rank Candidates'}
            </button>
            {isRecruiter() && (
              <button className="btn btn-secondary" onClick={() => navigate(`/jobs/${id}/edit`)}>✏️ Edit</button>
            )}
          </div>
        }
      />
      <div className="page-body">
        {/* Header info */}
        <div className="card mb-4">
          <div className="card-body">
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <div><div className="text-sm text-gray">Status</div><StatusBadge status={job.status} /></div>
              <div><div className="text-sm text-gray">Type</div><div style={{ fontWeight: 600 }}>{job.employmentType?.replace('_', ' ')}</div></div>
              <div><div className="text-sm text-gray">Openings</div><div style={{ fontWeight: 600 }}>{job.openings || 1}</div></div>
              <div><div className="text-sm text-gray">Salary</div><div style={{ fontWeight: 600, color: 'var(--success)' }}>{job.salaryRange || 'Competitive'}</div></div>
              <div><div className="text-sm text-gray">Applicants</div><div style={{ fontWeight: 600 }}>{job.applicantCount || 0}</div></div>
              {isAdmin() && (
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  {job.status !== 'OPEN' && <button className="btn btn-success btn-sm" onClick={() => handleStatusChange('OPEN')}>Open</button>}
                  {job.status === 'OPEN' && <button className="btn btn-secondary btn-sm" onClick={() => handleStatusChange('CLOSED')}>Close</button>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {['overview', 'applicants', 'ranked'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? '📋 Overview' : t === 'applicants' ? `👥 Applicants (${applicants.length})` : '🏆 AI Ranked'}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
            <div className="card">
              <div className="card-body" style={{ lineHeight: 1.8 }}>
                <h3 style={{ marginBottom: 12 }}>Job Description</h3>
                <div style={{ color: 'var(--gray-600)', whiteSpace: 'pre-wrap' }}>{job.description || 'No description provided.'}</div>
                {job.requirements && <>
                  <h3 style={{ margin: '20px 0 10px' }}>Requirements</h3>
                  <div style={{ color: 'var(--gray-600)', whiteSpace: 'pre-wrap' }}>{job.requirements}</div>
                </>}
                {job.benefits && <>
                  <h3 style={{ margin: '20px 0 10px' }}>Benefits</h3>
                  <div style={{ color: 'var(--gray-600)', whiteSpace: 'pre-wrap' }}>{job.benefits}</div>
                </>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div className="card-header"><div className="card-title">📤 Share Job</div></div>
                <div className="card-body">
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 10 }}>Public application link:</div>
                  <div style={{ background: 'var(--gray-50)', borderRadius: 6, padding: '6px 10px', fontSize: 11, wordBreak: 'break-all', color: 'var(--primary)' }}>
                    {window.location.origin}/apply/{job.id}
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }}
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/apply/${job.id}`); toast.success('Link copied!'); }}>
                    📋 Copy Link
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">📊 Pipeline</div></div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[['Applied', 'badge-blue'], ['Shortlisted', 'badge-green'], ['Interview', 'badge-purple'], ['Offered', 'badge-green']].map(([s, c]) => (
                    <div key={s} className="flex items-center justify-between">
                      <span className={`badge ${c}`}>{s}</span>
                      <span style={{ fontWeight: 600 }}>{applicants.filter(a => a.status === s.toUpperCase()).length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'applicants' && (
          <ApplicantsTable applicants={applicants} onView={aid => navigate(`/applicants/${aid}`)} />
        )}

        {tab === 'ranked' && (
          ranked.length === 0 ? (
            <div className="card"><div className="card-body">
              <div className="empty-state"><div className="icon">🤖</div>
                <h3>No Rankings Yet</h3><p>Click "AI Rank Candidates" to get AI-powered rankings.</p>
              </div>
            </div></div>
          ) : (
            <div className="card">
              <div className="card-header">
                <div className="card-title">🏆 AI Candidate Rankings</div>
                <span className="ai-badge">✨ AI Powered</span>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>#</th><th>Candidate</th><th>AI Score</th><th>Status</th><th>AI Reasoning</th></tr></thead>
                  <tbody>
                    {ranked.map((c, i) => (
                      <tr key={c.applicantId} style={{ cursor: 'pointer' }} onClick={() => navigate(`/applicants/${c.applicantId}`)}>
                        <td>
                          <div style={{ width: 28, height: 28, borderRadius: '50%',
                            background: i === 0 ? '#fbbf24' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7c32' : 'var(--gray-100)',
                            display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13 }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                          </div>
                        </td>
                        <td><div style={{ fontWeight: 600 }}>{c.name}</div><div className="text-sm text-gray">{c.email}</div></td>
                        <td>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 44, height: 44, borderRadius: '50%', border: '3px solid',
                            fontWeight: 700, fontSize: 13,
                            borderColor: c.aiScore >= 70 ? 'var(--success)' : c.aiScore >= 40 ? 'var(--warning)' : 'var(--danger)',
                            color: c.aiScore >= 70 ? 'var(--success)' : c.aiScore >= 40 ? 'var(--warning)' : 'var(--danger)',
                          }}>{c.aiScore || '—'}</div>
                        </td>
                        <td><StatusBadge status={c.status} /></td>
                        <td style={{ fontSize: 12.5, color: 'var(--gray-600)', maxWidth: 280 }}>{c.reasoning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}

function ApplicantsTable({ applicants, onView }) {
  if (applicants.length === 0) return (
    <div className="card"><div className="card-body">
      <div className="empty-state"><div className="icon">👥</div><h3>No Applicants Yet</h3></div>
    </div></div>
  );
  return (
    <div className="card">
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>AI Score</th><th>Applied</th><th></th></tr></thead>
          <tbody>
            {applicants.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.firstName} {a.lastName}</td>
                <td className="text-gray">{a.email}</td>
                <td><StatusBadge status={a.status} /></td>
                <td>
                  {a.aiScore != null ? (
                    <span style={{ fontWeight: 700, color: a.aiScore >= 70 ? 'var(--success)' : a.aiScore >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                      {a.aiScore}/100
                    </span>
                  ) : <span className="text-gray">—</span>}
                </td>
                <td className="text-gray" style={{ fontSize: 12 }}>
                  {a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}
                </td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => onView(a.id)}>View →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Create/Edit Job Form ──────────────────────────────────────────────────────
function JobForm({ initial = {}, onSubmit, loading, submitLabel = 'Save Job' }) {
  const [form, setForm] = useState({
    title: '', department: '', location: '', employmentType: 'FULL_TIME',
    description: '', requirements: '', benefits: '', salaryRange: '', openings: 1,
    status: 'DRAFT', ...initial
  });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="form-grid form-grid-2">
        <div className="form-group">
          <label className="form-label">Job Title <span className="required">*</span></label>
          <input className="form-input" value={form.title} onChange={set('title')} required placeholder="e.g. Senior Backend Engineer" />
        </div>
        <div className="form-group">
          <label className="form-label">Department <span className="required">*</span></label>
          <input className="form-input" value={form.department} onChange={set('department')} required placeholder="e.g. Engineering" />
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" value={form.location} onChange={set('location')} placeholder="e.g. Bangalore / Remote" />
        </div>
        <div className="form-group">
          <label className="form-label">Employment Type</label>
          <select className="form-select" value={form.employmentType} onChange={set('employmentType')}>
            {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'].map(t =>
              <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Salary Range</label>
          <input className="form-input" value={form.salaryRange} onChange={set('salaryRange')} placeholder="e.g. ₹20L – ₹35L" />
        </div>
        <div className="form-group">
          <label className="form-label">Openings</label>
          <input className="form-input" type="number" min="1" value={form.openings} onChange={set('openings')} />
        </div>
        <div className="form-group">
          <label className="form-label">Closing Date</label>
          <input className="form-input" type="date" value={form.closingDate || ''} onChange={set('closingDate')} />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={set('status')}>
            {['DRAFT', 'OPEN', 'CLOSED', 'ON_HOLD'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Job Description</label>
        <textarea className="form-textarea" rows={5} value={form.description} onChange={set('description')}
          placeholder="Describe the role, team, and impact…" style={{ minHeight: 120 }} />
      </div>
      <div className="form-group">
        <label className="form-label">Requirements</label>
        <textarea className="form-textarea" rows={4} value={form.requirements} onChange={set('requirements')}
          placeholder="List key requirements and qualifications…" />
      </div>
      <div className="form-group">
        <label className="form-label">Benefits</label>
        <textarea className="form-textarea" rows={3} value={form.benefits} onChange={set('benefits')}
          placeholder="Health insurance, stock options, flexible hours…" />
      </div>
      <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function CreateJobPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await jobsAPI.create(data);
      toast.success('Job posted!');
      navigate(`/jobs/${res.data.data.id}`);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create job'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <PageHeader title="Post New Job" subtitle="Fill in the details to create a new job posting" />
      <div className="page-body">
        <div className="card"><div className="card-body">
          <JobForm onSubmit={handleSubmit} loading={loading} submitLabel="Post Job" />
        </div></div>
      </div>
    </>
  );
}

export function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    jobsAPI.getById(id).then(r => setJob(r.data.data)).catch(() => navigate('/jobs'));
  }, [id, navigate]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await jobsAPI.update(id, data);
      toast.success('Job updated!');
      navigate(`/jobs/${id}`);
    } catch (e) { toast.error('Failed to update'); }
    finally { setLoading(false); }
  };

  if (!job) return <><PageHeader title="Edit Job" /><div className="page-body"><Loading /></div></>;

  return (
    <>
      <PageHeader title="Edit Job" subtitle={job.title} />
      <div className="page-body">
        <div className="card"><div className="card-body">
          <JobForm initial={job} onSubmit={handleSubmit} loading={loading} submitLabel="Update Job" />
        </div></div>
      </div>
    </>
  );
}

export default JobDetailPage;
