import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../services/api';
import { PageHeader, StatusBadge, EmptyState, Pagination, Loading } from '../components/common/Common';
import { useAuth } from '../store/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_OPTS = ['', 'OPEN', 'DRAFT', 'CLOSED', 'ON_HOLD'];
const TYPE_ICONS = { FULL_TIME: '⏰', PART_TIME: '🕐', CONTRACT: '📋', INTERNSHIP: '🎓' };

export default function JobsPage() {
  const { isRecruiter } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [dept, setDept] = useState('');
  const [departments, setDepartments] = useState([]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.getAll({ keyword, status, department: dept, page, size: 12 });
      setJobs(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [keyword, status, dept, page]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => {
    jobsAPI.getDepartments().then(r => setDepartments(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <PageHeader
        title="Job Postings"
        subtitle={`${jobs.length} jobs found`}
        actions={
          isRecruiter() && (
            <button className="btn btn-primary" onClick={() => navigate('/jobs/new')}>
              + Post New Job
            </button>
          )
        }
      />
      <div className="page-body">
        {/* Filters */}
        <div className="filters-bar">
          <div className="search-input-wrap">
            <span className="icon">🔍</span>
            <input className="form-input search-input" placeholder="Search jobs, departments…"
              value={keyword} onChange={e => { setKeyword(e.target.value); setPage(0); }} />
          </div>
          <select className="form-select" style={{ width: 140 }} value={status}
            onChange={e => { setStatus(e.target.value); setPage(0); }}>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <select className="form-select" style={{ width: 160 }} value={dept}
            onChange={e => { setDept(e.target.value); setPage(0); }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {loading ? <Loading /> : jobs.length === 0 ? (
          <EmptyState icon="💼" title="No Jobs Found"
            message="Try adjusting your filters or post a new position."
            action={isRecruiter() &&
              <button className="btn btn-primary" onClick={() => navigate('/jobs/new')}>Post Job</button>}
          />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {jobs.map(job => <JobCard key={job.id} job={job} onClick={() => navigate(`/jobs/${job.id}`)} />)}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}

function JobCard({ job, onClick }) {
  return (
    <div className="card" style={{ cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
      onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
      <div className="card-body">
        <div className="flex items-center justify-between mb-4" style={{ marginBottom: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: 'var(--primary-light)',
            display: 'grid', placeItems: 'center', fontSize: 20
          }}>
            {TYPE_ICONS[job.employmentType] || '💼'}
          </div>
          <StatusBadge status={job.status} />
        </div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{job.title}</div>
        <div className="text-sm text-gray" style={{ marginBottom: 10 }}>
          {job.department} {job.location && `· 📍 ${job.location}`}
        </div>
        {job.description && (
          <p style={{ fontSize: 12.5, color: 'var(--gray-600)', marginBottom: 10, lineHeight: 1.5 }}
            className="truncate">
            {job.description.substring(0, 100)}…
          </p>
        )}
        <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 10 }}>
          <div className="text-sm text-gray">
            👥 {job.applicantCount || 0} applicant{job.applicantCount !== 1 ? 's' : ''}
          </div>
          {job.salaryRange && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>{job.salaryRange}</div>}
        </div>
        {job.closingDate && (
          <div className="text-sm text-gray" style={{ marginTop: 6 }}>
            ⏳ Closes {format(new Date(job.closingDate), 'MMM d, yyyy')}
          </div>
        )}
      </div>
    </div>
  );
}
