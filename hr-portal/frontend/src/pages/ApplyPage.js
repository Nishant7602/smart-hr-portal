import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jobsAPI, applicantsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ApplyPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resume, setResume] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    linkedinUrl: '', portfolioUrl: '', coverLetter: ''
  });

  useEffect(() => {
    jobsAPI.getById(jobId).then(r => setJob(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [jobId]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.firstName || !form.lastName) { toast.error('Please fill required fields'); return; }
    setSubmitting(true);
    try {
      await applicantsAPI.apply(jobId, form, resume);
      setSubmitted(true);
      toast.success('Application submitted!');
    } catch (e) { toast.error(e.response?.data?.message || 'Submission failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (submitted) return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ textAlign: 'center', background: 'white', borderRadius: 16, padding: 48, maxWidth: 480, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Application Submitted!</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 14, lineHeight: 1.6 }}>
          Thank you for applying to <strong>{job?.title}</strong>. Our AI will screen your resume and
          our team will reach out within 5 business days.
        </p>
        <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--primary-light)', borderRadius: 8, fontSize: 13 }}>
          ✨ Your resume is being analyzed by Claude AI
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)', padding: '32px 20px'
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,var(--primary),#7c3aed)',
          borderRadius: 14, padding: 28, marginBottom: 24, color: 'white'
        }}>
          <div style={{ fontSize: 12, opacity: .8, marginBottom: 6 }}>🏢 SmartHR Portal</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{job?.title || 'Apply Now'}</h1>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, opacity: .9, flexWrap: 'wrap' }}>
            {job?.department && <span>📁 {job.department}</span>}
            {job?.location && <span>📍 {job.location}</span>}
            {job?.employmentType && <span>⏰ {job.employmentType.replace('_', ' ')}</span>}
            {job?.salaryRange && <span>💰 {job.salaryRange}</span>}
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📋 Application Form</div>
            <span className="ai-badge">✨ AI Screened</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">First Name <span className="required">*</span></label>
                  <input className="form-input" value={form.firstName} onChange={set('firstName')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name <span className="required">*</span></label>
                  <input className="form-input" value={form.lastName} onChange={set('lastName')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email <span className="required">*</span></label>
                  <input className="form-input" type="email" value={form.email} onChange={set('email')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210" />
                </div>
                <div className="form-group">
                  <label className="form-label">LinkedIn URL</label>
                  <input className="form-input" value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/…" />
                </div>
                <div className="form-group">
                  <label className="form-label">Portfolio / GitHub</label>
                  <input className="form-input" value={form.portfolioUrl} onChange={set('portfolioUrl')} placeholder="https://github.com/…" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Resume (PDF)</label>
                <div style={{
                  border: '2px dashed var(--gray-200)', borderRadius: 8, padding: '20px',
                  textAlign: 'center', cursor: 'pointer', background: resume ? 'var(--primary-light)' : 'white',
                  transition: 'all .2s'
                }}
                  onClick={() => document.getElementById('resume-input').click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); setResume(e.dataTransfer.files[0]); }}>
                  <input id="resume-input" type="file" accept=".pdf" style={{ display: 'none' }}
                    onChange={e => setResume(e.target.files[0])} />
                  {resume ? (
                    <div>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                      <div style={{ fontWeight: 600 }}>{resume.name}</div>
                      <div className="text-sm text-gray">{(resume.size / 1024 / 1024).toFixed(1)} MB</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 32, marginBottom: 6 }}>📎</div>
                      <div style={{ fontWeight: 600 }}>Drop PDF here or click to upload</div>
                      <div className="text-sm text-gray">Max 10MB · PDF format · AI will extract and analyze</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cover Letter</label>
                <textarea className="form-textarea" rows={4} value={form.coverLetter} onChange={set('coverLetter')}
                  placeholder="Tell us why you're a great fit for this role…" />
              </div>

              <div style={{ background: 'var(--primary-light)', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, color: 'var(--primary)' }}>
                🤖 Your resume will be automatically screened by Claude AI to match your skills with this role.
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}
                style={{ width: '100%', justifyContent: 'center' }}>
                {submitting ? 'Submitting Application…' : '🚀 Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
