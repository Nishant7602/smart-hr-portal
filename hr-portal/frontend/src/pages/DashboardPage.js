import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/Common';
import { jobsAPI, applicantsAPI, interviewsAPI } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { format } from 'date-fns';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '20' }}>
        <span>{icon}</span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalJobs: 0, openJobs: 0, totalApplicants: 0, upcomingInterviews: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [jobsRes, interviewsRes] = await Promise.all([
          jobsAPI.getAll({ size: 5, status: 'OPEN' }),
          interviewsAPI.getUpcoming(),
        ]);
        const jobData = jobsRes.data;
        setJobs(jobData.content || []);
        setUpcoming(interviewsRes.data || []);
        setStats({
          totalJobs: jobData.totalElements || 0,
          openJobs: (jobData.content || []).length,
          totalApplicants: 0,
          upcomingInterviews: (interviewsRes.data || []).length,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <PageHeader
        title={`${greeting}, ${user?.fullName?.split(' ')[0]} 👋`}
        subtitle={`${format(new Date(), 'EEEE, MMMM d yyyy')} · Here's your recruitment overview`}
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/jobs/new')}>
            + Post New Job
          </button>
        }
      />

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid mb-6">
          <StatCard icon="💼" label="Open Positions" value={stats.openJobs}
            sub="Active job postings" color="var(--primary)" />
          <StatCard icon="👥" label="Total Applicants" value="—"
            sub="Across all jobs" color="var(--secondary)" />
          <StatCard icon="📅" label="Upcoming Interviews" value={stats.upcomingInterviews}
            sub="Next 7 days" color="var(--warning)" />
          <StatCard icon="✅" label="Positions Filled" value="—"
            sub="This month" color="var(--success)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Recent Open Jobs */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📋 Recent Open Jobs</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/jobs')}>View All →</button>
            </div>
            {loading ? (
              <div className="card-body"><div className="text-gray text-sm">Loading…</div></div>
            ) : jobs.length === 0 ? (
              <div className="card-body">
                <div className="empty-state" style={{ padding: 24 }}>
                  <div className="icon">💼</div>
                  <p>No open positions yet</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }}
                    onClick={() => navigate('/jobs/new')}>Post First Job</button>
                </div>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr>
                    <th>Role</th><th>Dept</th><th>Location</th>
                  </tr></thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/jobs/${j.id}`)}>
                        <td><div style={{ fontWeight: 600 }}>{j.title}</div></td>
                        <td><span className="badge badge-blue">{j.department}</span></td>
                        <td className="text-gray">{j.location || 'Remote'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Upcoming Interviews */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📅 Upcoming Interviews</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/interviews')}>View All →</button>
            </div>
            {loading ? (
              <div className="card-body"><div className="text-gray text-sm">Loading…</div></div>
            ) : upcoming.length === 0 ? (
              <div className="card-body">
                <div className="empty-state" style={{ padding: 24 }}>
                  <div className="icon">📅</div>
                  <p>No upcoming interviews</p>
                </div>
              </div>
            ) : (
              <div style={{ padding: '0 0 8px' }}>
                {upcoming.slice(0, 5).map(i => (
                  <div key={i.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
                    borderBottom: '1px solid var(--gray-50)'
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, background: 'var(--primary-light)',
                      display: 'grid', placeItems: 'center', fontSize: 18, flexShrink: 0
                    }}>
                      {i.type === 'VIDEO' ? '🎥' : i.type === 'PHONE_SCREEN' ? '📞' : '🤝'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{i.applicantName}</div>
                      <div className="text-sm text-gray">{i.jobTitle} · {i.type?.replace(/_/g, ' ')}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>
                        {format(new Date(i.scheduledAt), 'MMM d')}
                      </div>
                      <div className="text-sm text-gray">{format(new Date(i.scheduledAt), 'HH:mm')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mt-4">
          <div className="card-header"><div className="card-title">⚡ Quick Actions</div></div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { icon: '📝', label: 'Generate Job Description', action: () => navigate('/ai-tools'), color: '#4f46e5' },
                { icon: '🔍', label: 'Screen Resume with AI', action: () => navigate('/applicants'), color: '#06b6d4' },
                { icon: '📅', label: 'Schedule Interview', action: () => navigate('/interviews'), color: '#f59e0b' },
                { icon: '🏆', label: 'View Ranked Candidates', action: () => navigate('/applicants'), color: '#10b981' },
              ].map(({ icon, label, action, color }) => (
                <button key={label} className="btn btn-secondary" onClick={action}
                  style={{ gap: 8, padding: '10px 16px' }}>
                  <span>{icon}</span>{label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
