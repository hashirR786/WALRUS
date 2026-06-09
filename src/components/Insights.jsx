import React, { useState } from 'react';
import { Zap, Lightbulb, BookOpen, Briefcase, User, HelpCircle, Send, Sparkles, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Insights = ({ token, suggestions, tasks, loading }) => {
  const [question, setQuestion] = useState('');
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const priority = suggestions?.priority || "None defined";
  const tips = suggestions?.tips || [];

  const handleAskCoach = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoadingAdvice(true);
    try {
      const res = await fetch(`${API_BASE}/coach/ask`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error('Failed to get coach advice');
      const data = await res.json();
      setAdvice(data.advice);
    } catch (error) {
      console.error(error);
      setAdvice(`Could not connect to coach: ${error.message}`);
    } finally {
      setLoadingAdvice(false);
    }
  };

  // Group active tasks into categories dynamically based on keywords for frontend visualization
  const categorizeTasks = () => {
    const categories = {
      study: [],
      career: [],
      personal: [],
      general: []
    };

    tasks.forEach(task => {
      const lowerTitle = task.title.toLowerCase();
      if (lowerTitle.includes('study') || lowerTitle.includes('learn') || lowerTitle.includes('assignment') || lowerTitle.includes('dbms') || lowerTitle.includes('exam')) {
        categories.study.push(task);
      } else if (lowerTitle.includes('career') || lowerTitle.includes('resume') || lowerTitle.includes('internship') || lowerTitle.includes('portfolio') || lowerTitle.includes('interview') || lowerTitle.includes('apply')) {
        categories.career.push(task);
      } else if (lowerTitle.includes('personal') || lowerTitle.includes('buy') || lowerTitle.includes('exercise') || lowerTitle.includes('clean') || lowerTitle.includes('call')) {
        categories.personal.push(task);
      } else {
        categories.general.push(task);
      }
    });

    return categories;
  };

  const categorized = categorizeTasks();
  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  // Calculate completion percentage
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <>
      {/* Priority Insight Card */}
      <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 className="ai-title" style={{ color: 'var(--danger)', marginBottom: 0 }}>
          <Zap size={18} fill="currentColor" />
          <span>Priority Insight</span>
        </h3>

        {loading ? (
          <div className="skeleton" style={{ height: '55px', width: '100%' }} />
        ) : (
          <div className="insight-card" style={{ margin: 0 }}>
            <div className="insight-label">Highest Priority Recommendation</div>
            <div className="insight-value" style={{ fontSize: '1.1rem', lineHeight: '1.4' }}>{priority}</div>
          </div>
        )}

        {/* AI Coaching Interaction Box */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
          <div className="insight-label" style={{ marginBottom: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sparkles size={14} />
            <span>Ask Walrus</span>
          </div>

          <form onSubmit={handleAskCoach} className="input-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              className="input-field"
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
              placeholder="e.g., How can I prepare for DBMS?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loadingAdvice}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 0.75rem' }} disabled={loadingAdvice || !question.trim()}>
              {loadingAdvice ? <Loader2 className="spinner" size={15} /> : <Send size={15} />}
            </button>
          </form>

          {/* Coach Advice Bubble */}
          {advice && (
            <div className="glass-panel" style={{
              marginTop: '1rem',
              padding: '0.85rem',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              maxHeight: '220px',
              overflowY: 'auto',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Sparkles size={13} /> Coach Advice
                </span>
                <button
                  type="button"
                  onClick={() => { setAdvice(''); setQuestion(''); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                >
                  Clear
                </button>
              </div>
              <div style={{ whiteSpace: 'pre-line', color: 'var(--text-primary)', lineHeight: '1.6', fontWeight: 500 }}>
                {advice}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Statistics & Categories Panel */}
      <div className="glass-panel">
        <h2>Dashboard Analytics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Tasks</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{activeCount}</div>
          </div>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Completion Rate</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{completionRate}%</div>
          </div>
        </div>

        {/* Categorized Tasks Breakdown */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Categorized Items ({tasks.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <BookOpen size={14} className="text-primary" /> Study
              </span>
              <span style={{ fontWeight: 600 }}>{categorized.study.length} active</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <Briefcase size={14} className="text-secondary" /> Career
              </span>
              <span style={{ fontWeight: 600 }}>{categorized.career.length} active</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <User size={14} className="text-success" /> Personal
              </span>
              <span style={{ fontWeight: 600 }}>{categorized.personal.length} active</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <HelpCircle size={14} className="text-muted" /> General
              </span>
              <span style={{ fontWeight: 600 }}>{categorized.general.length} active</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Productivity Tips */}
      <div className="glass-panel grid-span-2">
        <h3 className="ai-title" style={{ color: 'var(--warning)', borderBottom: 'none', paddingBottom: 0, marginBottom: '0.75rem' }}>
          <Lightbulb size={18} />
          <span>Productivity Tips</span>
        </h3>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: '20px', width: '100%' }} />
            <div className="skeleton" style={{ height: '20px', width: '90%' }} />
          </div>
        ) : (
          <div className="tips-section" style={{ borderTop: 'none', paddingTop: 0 }}>
            {tips.length > 0 ? (
              tips.map((tip, idx) => (
                <div key={`tip-${idx}`} className="tip-item">
                  <Lightbulb size={15} className="tip-icon" />
                  <span>{tip}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Generate suggestions to see personalized tips here.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Insights;
