import React from 'react';
import { Sparkles, Plus, RefreshCw, AlertCircle } from 'lucide-react';

const Suggestions = ({ suggestions, loading, onRefresh, onAddSuggestedTask }) => {
  // Renders loading skeleton shimmer
  const renderSkeleton = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="skeleton" style={{ height: '50px', width: '100%' }} />
        <div className="skeleton" style={{ height: '35px', width: '70%' }} />
        <div className="skeleton" style={{ height: '35px', width: '100%' }} />
        <div className="skeleton" style={{ height: '35px', width: '90%' }} />
        <div className="skeleton" style={{ height: '35px', width: '80%' }} />
      </div>
    );
  };

  const missingTasks = suggestions?.missing_tasks || [];
  const suggestedTasks = suggestions?.suggested_tasks || [];

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div className="ai-header">
        <h3 className="ai-title">
          <Sparkles size={18} />
          <span>Smart Suggestions</span>
          <span className="ai-badge">Groq Llama 3</span>
        </h3>
        <button 
          className="btn-icon" 
          onClick={onRefresh} 
          disabled={loading} 
          title="Refresh AI suggestions"
          style={{ animation: loading ? 'rotate 2s linear infinite' : 'none' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        renderSkeleton()
      ) : (
        <>
          {/* Missing Tasks Panel */}
          {missingTasks.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={14} className="text-warning" />
                Missing Tasks (Recommended)
              </h4>
              <div className="suggestion-list">
                {missingTasks.map((task, idx) => (
                  <div key={`missing-${idx}`} className="suggestion-item">
                    <span className="suggestion-text">{task}</span>
                    <button 
                      className="btn-icon" 
                      onClick={() => onAddSuggestedTask(task)}
                      title="Add to my list"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Useful Next Tasks */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Recommended Next Steps
            </h4>
            <div className="suggestion-list">
              {suggestedTasks.length > 0 ? (
                suggestedTasks.map((task, idx) => (
                  <div key={`suggested-${idx}`} className="suggestion-item">
                    <span className="suggestion-text">{task}</span>
                    <button 
                      className="btn-icon" 
                      onClick={() => onAddSuggestedTask(task)}
                      title="Add to my list"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                  No suggestions available. Click the refresh button to generate them!
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Suggestions;
