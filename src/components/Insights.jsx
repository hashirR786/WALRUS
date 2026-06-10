import React, { useState } from 'react';
import { Lightbulb, BookOpen, Briefcase, User, HelpCircle, Send, Sparkles, Loader2, Award, Calendar, AlertTriangle } from 'lucide-react';
import { API_BASE } from '../config';

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

  // 1. Group tasks by category
  const getTasksByCategory = (catName) => {
    return tasks.filter(t => (t.category || 'general').toLowerCase() === catName.toLowerCase());
  };

  // 2. Count priorities
  const getTasksByPriority = (priName) => {
    return tasks.filter(t => (t.priority || 'medium').toLowerCase() === priName.toLowerCase());
  };

  // 3. Daily Productivity Score Calculations
  const getDailyProductivityScore = () => {
    const today = new Date();
    // Tasks completed today
    const completedToday = tasks.filter(task => {
      if (!task.completed || !task.completedAt) return false;
      const compDate = new Date(task.completedAt);
      return compDate.getFullYear() === today.getFullYear() &&
             compDate.getMonth() === today.getMonth() &&
             compDate.getDate() === today.getDate();
    });

    // Score weight mapping
    let points = 0;
    completedToday.forEach(task => {
      const pri = (task.priority || 'medium').toLowerCase();
      if (pri === 'high') points += 30;
      else if (pri === 'medium') points += 20;
      else if (pri === 'low') points += 10;
    });

    // Overdue pending tasks penalty
    const overdueTasks = tasks.filter(task => {
      if (task.completed || !task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return dueDate < today;
    });
    points -= overdueTasks.length * 5;

    // Cap score between 0 and 100
    return Math.max(0, Math.min(100, points));
  };

  // 4. On-Time Completion Rate
  const getOnTimeCompletionRate = () => {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) return 100;

    const onTimeCompleted = completedTasks.filter(t => {
      if (!t.dueDate) return true; // No deadline = always on time
      const due = new Date(t.dueDate);
      const comp = new Date(t.completedAt || t.createdAt);
      due.setHours(23, 59, 59, 999);
      return comp <= due;
    });

    return Math.round((onTimeCompleted.length / completedTasks.length) * 100);
  };

  // Helper values for score milestones
  const score = getDailyProductivityScore();
  const onTimeRate = getOnTimeCompletionRate();
  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getScoreMilestone = (scoreVal) => {
    if (scoreVal === 0) return { milestone: "Ready to Start", desc: "No points yet today. Complete tasks to increase your score!" };
    if (scoreVal <= 35) return { milestone: "Off to a Good Start!", desc: "Nice job! Keep checking off pending items." };
    if (scoreVal <= 70) return { milestone: "On a Roll!", desc: "Excellent progress today. You are staying productive!" };
    if (scoreVal <= 99) return { milestone: "Outstanding Focus!", desc: "You are crushing it. Just a few steps left to perfection!" };
    return { milestone: "Master of Productivity! 🏆", desc: "Clean sweep! You've achieved a perfect score today!" };
  };

  const scoreMilestone = getScoreMilestone(score);

  // SVG parameters for radial gauge
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <>
      {/* LEFT COLUMN: Priority Insight & Coach & Productivity Score */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Priority Insight & Coach Card */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 className="ai-title" style={{ color: 'var(--danger)', marginBottom: 0 }}>
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
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
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
                maxHeight: '200px',
                overflowY: 'auto',
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

        {/* Productivity Score Card */}
        <div className="score-widget">
          <span className="score-title">Daily Productivity Score</span>
          <div className="score-radial">
            <svg className="score-circle-svg">
              <circle className="score-circle-bg" cx="60" cy="60" r={radius} />
              <circle 
                className="score-circle-progress" 
                cx="60" 
                cy="60" 
                r={radius} 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <span className="score-value">{score}</span>
          </div>
          <span className="score-milestone">{scoreMilestone.milestone}</span>
          <span className="score-desc">{scoreMilestone.desc}</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Statistics Dashboard */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h2>Dashboard Analytics</h2>

        {/* Core metrics row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{ padding: '0.65rem 0.5rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Tasks</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>{activeCount}</div>
          </div>
          <div style={{ padding: '0.65rem 0.5rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Completion Rate</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--success)' }}>{completionRate}%</div>
          </div>
          <div style={{ padding: '0.65rem 0.5rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>On-Time Rate</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--warning)' }}>{onTimeRate}%</div>
          </div>
        </div>

        {/* Priority Breakdown Progress Bars */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
            Priority Breakdown
          </h4>
          
          {['high', 'medium', 'low'].map(pri => {
            const priTasks = getTasksByPriority(pri);
            const total = priTasks.length;
            const completed = priTasks.filter(t => t.completed).length;
            const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
            const label = pri === 'high' ? '🔴 High' : pri === 'medium' ? '🟡 Medium' : '⚪ Low';
            
            return (
              <div key={pri} className="stat-item">
                <div className="stat-label-row">
                  <span>{label}</span>
                  <span style={{ fontWeight: 600 }}>{completed}/{total} ({rate}%)</span>
                </div>
                <div className="stat-bar-bg">
                  <div className={`stat-bar-fill fill-${pri}`} style={{ width: `${rate}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Distribution Breakdown */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
            Category Breakdown ({tasks.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {[
              { name: 'study', icon: <BookOpen size={13} />, className: 'text-primary', label: 'Study' },
              { name: 'career', icon: <Briefcase size={13} />, className: 'text-secondary', label: 'Career' },
              { name: 'personal', icon: <User size={13} />, className: 'text-success', label: 'Personal' },
              { name: 'work', icon: <Award size={13} />, className: 'text-warning', label: 'Work' },
              { name: 'general', icon: <HelpCircle size={13} />, className: 'text-muted', label: 'General' }
            ].map(cat => {
              const catTasks = getTasksByCategory(cat.name);
              const active = catTasks.filter(t => !t.completed).length;
              const completed = catTasks.filter(t => t.completed).length;
              
              return (
                <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <span className={cat.className} style={{ display: 'flex', alignItems: 'center' }}>{cat.icon}</span> 
                    {cat.label}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {active} active <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {completed} completed</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FULL WIDTH BOTTOM: AI Productivity Tips */}
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
                  <span style={{ fontWeight: 500 }}>{tip}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
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
