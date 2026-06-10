import React, { useState, useRef, useEffect } from 'react';
import { PageHeader } from '../components/common/Common';
import { jobsAPI, aiAPI } from '../services/api';
import toast from 'react-hot-toast';

// ─── Shared AI Output Box ─────────────────────────────────────────────────────
function AIOutput({ content, loading, placeholder }) {
  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 48, gap: 16,
      background: 'linear-gradient(135deg,#f0f4ff,#faf5ff)',
      borderRadius: 10, border: '1px solid #c7d2fe'
    }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid #e0e7ff', borderTopColor: 'var(--primary)',
          animation: 'spin .7s linear infinite'
        }} />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 18 }}>✨</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--primary)' }}>Claude AI is thinking…</div>
        <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>Powered by claude-sonnet-4</div>
      </div>
    </div>
  );
  if (!content) return (
    <div style={{
      padding: 40, textAlign: 'center', background: 'var(--gray-50)',
      borderRadius: 10, border: '1.5px dashed var(--gray-200)'
    }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>✨</div>
      <div style={{ color: 'var(--gray-400)', fontSize: 13 }}>{placeholder || 'AI output will appear here'}</div>
    </div>
  );
  return (
    <div style={{
      background: 'linear-gradient(135deg,#f8faff,#fdf8ff)',
      border: '1px solid #c7d2fe', borderRadius: 10, padding: 20,
      fontSize: 13.5, lineHeight: 1.9, whiteSpace: 'pre-wrap',
      maxHeight: 480, overflowY: 'auto', color: 'var(--gray-800)'
    }}>{content}</div>
  );
}

function CopyBtn({ text }) {
  if (!text) return null;
  return (
    <button className="btn btn-secondary btn-sm"
      onClick={() => { navigator.clipboard.writeText(text); toast.success('Copied!'); }}>
      📋 Copy
    </button>
  );
}

function TwoCol({ left, right }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div className="card"><div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{left}</div></div>
      <div className="card"><div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{right}</div></div>
    </div>
  );
}

function SectionHeader({ icon, title, badge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
      {badge && <span className="ai-badge">{badge}</span>}
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div className="form-group" style={style}>
      {label && <label className="form-label">{label}</label>}
      {children}
    </div>
  );
}

function GenBtn({ onClick, loading, label }) {
  return (
    <button className="btn btn-primary" onClick={onClick} disabled={loading}
      style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '11px' }}>
      {loading
        ? <><div className="spinner" style={{ borderTopColor: 'white', width: 16, height: 16 }} />&nbsp;Generating…</>
        : <>✨ {label}</>}
    </button>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'jd',       icon: '📝', label: 'JD Generator' },
  { id: 'offer',    icon: '🎉', label: 'Offer Letter' },
  { id: 'reject',   icon: '💌', label: 'Rejection Email' },
  { id: 'skillgap', icon: '📊', label: 'Skill Gap' },
  { id: 'salary',   icon: '💰', label: 'Salary Benchmark' },
  { id: 'report',   icon: '📈', label: 'Hiring Report' },
  { id: 'chat',     icon: '🤖', label: 'HR Chatbot' },
];

export default function AIToolsPage() {
  const [tab, setTab] = useState('jd');
  return (
    <>
      <PageHeader
        title="🤖 AI Tools"
        subtitle="7 Claude AI-powered tools for smarter recruitment"
        actions={<span className="ai-badge" style={{ fontSize: 12, padding: '4px 12px' }}>✨ Powered by Claude Sonnet</span>}
      />
      <div className="page-body">
        <div style={{
          display: 'flex', gap: 4, flexWrap: 'wrap',
          background: 'white', padding: 8, borderRadius: 12,
          border: '1px solid var(--gray-200)', marginBottom: 24, boxShadow: 'var(--shadow)'
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              transition: 'all .15s',
              background: tab === t.id ? 'var(--primary)' : 'transparent',
              color: tab === t.id ? 'white' : 'var(--gray-600)',
            }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {tab === 'jd'       && <JDGenerator />}
        {tab === 'offer'    && <OfferLetterTool />}
        {tab === 'reject'   && <RejectionEmailTool />}
        {tab === 'skillgap' && <SkillGapTool />}
        {tab === 'salary'   && <SalaryBenchmarkTool />}
        {tab === 'report'   && <HiringReportTool />}
        {tab === 'chat'     && <HRChatbot />}
      </div>
    </>
  );
}

// ─── 1. JD Generator ─────────────────────────────────────────────────────────
function JDGenerator() {
  const [form, setForm] = useState({ title: '', department: '', location: '', employmentType: 'FULL_TIME', salaryRange: '', requirements: '', culture: '' });
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const PRESETS = [
    { l: 'Backend Eng', t: 'Senior Backend Engineer', d: 'Engineering', r: '5+ years Java/Spring Boot, microservices, PostgreSQL, AWS' },
    { l: 'React Dev', t: 'React Frontend Developer', d: 'Engineering', r: '3+ years React, TypeScript, TailwindCSS' },
    { l: 'Product Manager', t: 'Product Manager', d: 'Product', r: '4+ years PM, B2B SaaS, roadmap ownership' },
    { l: 'DevOps', t: 'DevOps Engineer', d: 'Infrastructure', r: 'Kubernetes, Terraform, AWS, Docker, CI/CD' },
    { l: 'Data Scientist', t: 'Data Scientist', d: 'Data & AI', r: 'Python, ML, TensorFlow, SQL, 3+ years' },
  ];

  const generate = async () => {
    if (!form.title || !form.department) { toast.error('Title and department required'); return; }
    setLoading(true); setOutput('');
    try {
      const res = await jobsAPI.generateJD(form);
      const text = res.data?.data;
      if (!text) throw new Error('No response from AI');
      setOutput(text);
      toast.success('JD Generated!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to generate';
      toast.error(msg, { duration: 6000 });
      setOutput('❌ Error: ' + msg + '\n\nPlease check:\n1. Your Claude API key is set correctly in application.yml\n2. The backend is running on port 8080\n3. You are logged in');
    } finally { setLoading(false); }
  };

  return (
    <TwoCol
      left={<>
        <SectionHeader icon="📝" title="Job Details" badge="Claude AI" />
        <div className="form-grid form-grid-2" style={{ gap: 12 }}>
          <Field label="Job Title *"><input className="form-input" value={form.title} onChange={set('title')} placeholder="Senior Backend Engineer" /></Field>
          <Field label="Department *"><input className="form-input" value={form.department} onChange={set('department')} placeholder="Engineering" /></Field>
          <Field label="Location"><input className="form-input" value={form.location} onChange={set('location')} placeholder="Bangalore / Remote" /></Field>
          <Field label="Type">
            <select className="form-select" value={form.employmentType} onChange={set('employmentType')}>
              {['FULL_TIME','PART_TIME','CONTRACT','INTERNSHIP'].map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
            </select>
          </Field>
          <Field label="Salary Range" style={{ gridColumn: '1/-1' }}><input className="form-input" value={form.salaryRange} onChange={set('salaryRange')} placeholder="₹20L – ₹35L" /></Field>
        </div>
        <Field label="Key Requirements"><textarea className="form-textarea" rows={3} value={form.requirements} onChange={set('requirements')} placeholder="5+ years Java, Spring Boot, microservices, AWS…" /></Field>
        <Field label="Company Culture"><textarea className="form-textarea" rows={2} value={form.culture} onChange={set('culture')} placeholder="Remote-first, collaborative, data-driven…" /></Field>
        <div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Quick Presets:</div>
          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            {PRESETS.map(p => (
              <button key={p.l} className="btn btn-secondary btn-sm"
                onClick={() => setForm(f => ({ ...f, title: p.t, department: p.d, requirements: p.r }))}>
                {p.l}
              </button>
            ))}
          </div>
        </div>
        <GenBtn onClick={generate} loading={loading} label="Generate Job Description" />
      </>}
      right={<>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <SectionHeader icon="📄" title="Generated JD" /><CopyBtn text={output} />
        </div>
        <AIOutput content={output} loading={loading} placeholder="Fill job details and click Generate" />
      </>}
    />
  );
}

// ─── 2. Offer Letter ─────────────────────────────────────────────────────────
function OfferLetterTool() {
  const [form, setForm] = useState({ candidateName: '', jobTitle: '', department: '', salary: '', startDate: '', companyName: 'SmartHR Technologies' });
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const generate = async () => {
    if (!form.candidateName || !form.jobTitle) { toast.error('Fill required fields'); return; }
    setLoading(true); setOutput('');
    try {
      const res = await aiAPI.generateOfferLetter(form);
      setOutput(res.data?.data || ''); toast.success('Offer letter ready!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to generate';
      toast.error(msg, { duration: 6000 }); setOutput('❌ Error: ' + msg);
    } finally { setLoading(false); }
  };

  return (
    <TwoCol
      left={<>
        <SectionHeader icon="🎉" title="Offer Letter Details" badge="Claude AI" />
        <Field label="Candidate Name *"><input className="form-input" value={form.candidateName} onChange={set('candidateName')} placeholder="Rahul Sharma" /></Field>
        <Field label="Job Title *"><input className="form-input" value={form.jobTitle} onChange={set('jobTitle')} placeholder="Senior Backend Engineer" /></Field>
        <Field label="Department"><input className="form-input" value={form.department} onChange={set('department')} placeholder="Engineering" /></Field>
        <Field label="Salary Package"><input className="form-input" value={form.salary} onChange={set('salary')} placeholder="₹30,00,000 per annum" /></Field>
        <Field label="Start Date"><input className="form-input" type="date" value={form.startDate} onChange={set('startDate')} /></Field>
        <Field label="Company Name *"><input className="form-input" value={form.companyName} onChange={set('companyName')} /></Field>
        <GenBtn onClick={generate} loading={loading} label="Generate Offer Letter" />
      </>}
      right={<>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <SectionHeader icon="📄" title="Generated Offer Letter" /><CopyBtn text={output} />
        </div>
        <AIOutput content={output} loading={loading} placeholder="Generate a professional, warm offer letter for your selected candidate" />
      </>}
    />
  );
}

// ─── 3. Rejection Email ──────────────────────────────────────────────────────
function RejectionEmailTool() {
  const [form, setForm] = useState({ candidateName: '', jobTitle: '', reason: '', encourageReapply: true });
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const REASONS = ['Insufficient experience level','Skills do not match tech stack','Stronger candidates available','Salary expectations beyond budget','Communication skills gap','Culture fit concerns'];

  const generate = async () => {
    if (!form.candidateName || !form.jobTitle) { toast.error('Fill required fields'); return; }
    setLoading(true); setOutput('');
    try {
      const res = await aiAPI.generateRejectionEmail(form);
      setOutput(res.data?.data || ''); toast.success('Email drafted!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to generate';
      toast.error(msg, { duration: 6000 }); setOutput('❌ Error: ' + msg);
    } finally { setLoading(false); }
  };

  return (
    <TwoCol
      left={<>
        <SectionHeader icon="💌" title="Rejection Email" badge="Claude AI" />
        <Field label="Candidate Name *"><input className="form-input" value={form.candidateName} onChange={e => set('candidateName')(e.target.value)} placeholder="Priya Patel" /></Field>
        <Field label="Job Title *"><input className="form-input" value={form.jobTitle} onChange={e => set('jobTitle')(e.target.value)} placeholder="Senior Backend Engineer" /></Field>
        <Field label="Primary Reason (internal — not shown to candidate)">
          <select className="form-select" value={form.reason} onChange={e => set('reason')(e.target.value)}>
            <option value="">Select reason…</option>
            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input className="form-input" value={form.reason} style={{ marginTop: 6 }}
            onChange={e => set('reason')(e.target.value)} placeholder="Or type custom reason…" />
        </Field>
        <Field label="">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={form.encourageReapply}
              onChange={e => set('encourageReapply')(e.target.checked)} style={{ width: 16, height: 16 }} />
            Encourage to reapply for future roles
          </label>
        </Field>
        <GenBtn onClick={generate} loading={loading} label="Generate Rejection Email" />
      </>}
      right={<>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <SectionHeader icon="📧" title="Generated Email" /><CopyBtn text={output} />
        </div>
        <AIOutput content={output} loading={loading} placeholder="Generate a compassionate, professional rejection email" />
      </>}
    />
  );
}

// ─── 4. Skill Gap ────────────────────────────────────────────────────────────
function SkillGapTool() {
  const [form, setForm] = useState({ jobRequirements: '', candidateResumeText: '' });
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const generate = async () => {
    if (!form.jobRequirements || !form.candidateResumeText) { toast.error('Fill both fields'); return; }
    setLoading(true); setOutput('');
    try {
      const res = await aiAPI.skillGap(form);
      setOutput(res.data?.data || ''); toast.success('Analysis complete!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed';
      toast.error(msg, { duration: 6000 }); setOutput('❌ Error: ' + msg);
    } finally { setLoading(false); }
  };

  return (
    <TwoCol
      left={<>
        <SectionHeader icon="📊" title="Skill Gap Analysis" badge="Claude AI" />
        <Field label="Job Requirements *">
          <textarea className="form-textarea" rows={5} value={form.jobRequirements} onChange={set('jobRequirements')}
            placeholder="5+ years Java, Spring Boot, microservices, AWS, PostgreSQL, Docker, REST APIs, team leadership…" />
        </Field>
        <Field label="Candidate Resume / Skills *">
          <textarea className="form-textarea" rows={6} value={form.candidateResumeText} onChange={set('candidateResumeText')}
            placeholder="Paste candidate's resume text or key skills here…&#10;&#10;Example:&#10;4 years Java, Spring MVC, MySQL, basic AWS, REST APIs, no cloud-native experience, led a team of 2…" />
        </Field>
        <GenBtn onClick={generate} loading={loading} label="Analyze Skill Gap" />
      </>}
      right={<>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <SectionHeader icon="🎯" title="Gap Analysis Result" /><CopyBtn text={output} />
        </div>
        <AIOutput content={output} loading={loading} placeholder="Get matched skills, critical gaps, trainable gaps, and a training plan recommendation" />
      </>}
    />
  );
}

// ─── 5. Salary Benchmark ─────────────────────────────────────────────────────
function SalaryBenchmarkTool() {
  const [form, setForm] = useState({ jobTitle: '', location: 'Bangalore', experience: '', skills: '' });
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const generate = async () => {
    if (!form.jobTitle) { toast.error('Job title required'); return; }
    setLoading(true); setOutput('');
    try { setOutput((await aiAPI.salaryBenchmark(form)).data.data); toast.success('Benchmark ready!'); }
    catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <TwoCol
      left={<>
        <SectionHeader icon="💰" title="Salary Benchmarking" badge="Claude AI" />
        <Field label="Job Title *"><input className="form-input" value={form.jobTitle} onChange={set('jobTitle')} placeholder="Senior Backend Engineer" /></Field>
        <Field label="Location">
          <select className="form-select" value={form.location} onChange={set('location')}>
            {['Bangalore','Mumbai','Delhi/NCR','Hyderabad','Pune','Chennai','Remote'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Experience Level">
          <select className="form-select" value={form.experience} onChange={set('experience')}>
            <option value="">Select level…</option>
            {['0-1 years (Fresher)','1-3 years (Junior)','3-5 years (Mid)','5-8 years (Senior)','8-12 years (Lead)','12+ years (Principal)'].map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </Field>
        <Field label="Key Skills">
          <textarea className="form-textarea" rows={3} value={form.skills} onChange={set('skills')} placeholder="Java, Spring Boot, AWS, Kubernetes, microservices…" />
        </Field>
        <GenBtn onClick={generate} loading={loading} label="Get Salary Benchmark" />
      </>}
      right={<>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <SectionHeader icon="📊" title="Market Benchmark" /><CopyBtn text={output} />
        </div>
        <AIOutput content={output} loading={loading} placeholder="Get salary ranges, competing companies, negotiation tips, and market positioning" />
      </>}
    />
  );
}

// ─── 6. Hiring Report ────────────────────────────────────────────────────────
function HiringReportTool() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    jobsAPI.getAll({ size: 50 }).then(r => setJobs(r.data.content || [])).catch(() => {});
  }, []);

  const generate = async () => {
    if (!selectedJob) { toast.error('Select a job'); return; }
    setLoading(true); setOutput('');
    try { setOutput((await aiAPI.hiringReport(selectedJob)).data.data); toast.success('Report generated!'); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed — ensure job has applicants'); }
    finally { setLoading(false); }
  };

  return (
    <TwoCol
      left={<>
        <SectionHeader icon="📈" title="Executive Hiring Report" badge="Claude AI" />
        <p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>
          Generate an executive-level summary of the entire applicant pool for a job — talent quality analysis, top candidate highlights, concerns, and hiring recommendations.
        </p>
        <Field label="Select Job *">
          <select className="form-select" value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
            <option value="">Choose a job posting…</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>{j.title} — {j.department} ({j.applicantCount || 0} applicants)</option>
            ))}
          </select>
        </Field>
        <div style={{ padding: '12px 14px', background: 'var(--primary-light)', borderRadius: 8, fontSize: 12.5, color: 'var(--primary)' }}>
          💡 The report analyzes all applicants, AI scores, pipeline status, and generates recommendations for the hiring manager.
        </div>
        <GenBtn onClick={generate} loading={loading} label="Generate Hiring Report" />
      </>}
      right={<>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <SectionHeader icon="📋" title="Executive Report" /><CopyBtn text={output} />
        </div>
        <AIOutput content={output} loading={loading} placeholder="Select a job to generate an AI-powered executive hiring report for the hiring manager" />
      </>}
    />
  );
}

// ─── 7. HR Chatbot ───────────────────────────────────────────────────────────
function HRChatbot() {
  const [messages, setMessages] = useState([{
    role: 'bot',
    text: "👋 Hi! I'm HRBot, your AI-powered HR assistant.\n\nI can help you with:\n• Recruitment best practices\n• Interview tips & techniques\n• Offer & salary negotiation guidance\n• Resume evaluation advice\n• HR policy questions\n\nWhat can I help you with today?"
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const QUICK = [
    'How do I write a great job description?',
    'What are best practices for technical interviews?',
    'How to handle salary negotiation?',
    'What are red flags in a resume?',
    'How to improve candidate experience?',
    'What is structured interviewing?',
    'How to reduce time-to-hire?',
    'What questions are illegal to ask in interviews?',
  ];

  const send = async (msg) => {
    const text = (msg || input).trim();
    if (!text || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await aiAPI.chat(text, '');
      setMessages(m => [...m, { role: 'bot', text: res.data.data }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: '⚠️ Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, height: 600 }}>
      {/* Quick questions sidebar */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header"><div className="card-title">💡 Quick Questions</div></div>
        <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, overflowY: 'auto' }}>
          {QUICK.map(q => (
            <button key={q} className="btn btn-secondary btn-sm" onClick={() => send(q)} disabled={loading}
              style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: 12, whiteSpace: 'normal', height: 'auto', lineHeight: 1.5, padding: '8px 10px' }}>
              {q}
            </button>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--gray-100)', fontSize: 11, color: 'var(--gray-400)', textAlign: 'center' }}>
            Powered by Claude AI<br/>claude-sonnet-4
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#7c3aed)', display: 'grid', placeItems: 'center', fontSize: 18 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>HRBot</div>
              <div style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                Online · Claude AI
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setMessages([{ role: 'bot', text: 'Chat cleared! How can I help you today?' }])}>
            🗑 Clear
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
              {m.role === 'bot' && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2, background: 'linear-gradient(135deg,var(--primary),#7c3aed)', display: 'grid', placeItems: 'center', fontSize: 14 }}>🤖</div>
              )}
              <div style={{
                maxWidth: '78%', padding: '10px 14px', borderRadius: 12, fontSize: 13.5,
                lineHeight: 1.7, whiteSpace: 'pre-wrap',
                background: m.role === 'user' ? 'linear-gradient(135deg,var(--primary),#7c3aed)' : 'white',
                color: m.role === 'user' ? 'white' : 'var(--gray-800)',
                boxShadow: 'var(--shadow)',
                borderBottomRightRadius: m.role === 'user' ? 4 : 12,
                borderBottomLeftRadius: m.role === 'bot' ? 4 : 12,
              }}>{m.text}</div>
              {m.role === 'user' && (
                <div className="avatar" style={{ width: 28, height: 28, fontSize: 12, flexShrink: 0, marginTop: 2 }}>HR</div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),#7c3aed)', display: 'grid', placeItems: 'center', fontSize: 14 }}>🤖</div>
              <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px 12px 12px 4px', boxShadow: 'var(--shadow)', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0,1,2].map(d => (
                  <div key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: `bounce .8s ease-in-out ${d*.15}s infinite alternate` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 10 }}>
          <input className="form-input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask HRBot anything about recruitment…"
            disabled={loading} style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()} style={{ padding: '8px 18px', fontSize: 16 }}>
            {loading ? '…' : '➤'}
          </button>
        </div>
      </div>
      <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }`}</style>
    </div>
  );
}
