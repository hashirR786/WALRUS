import React, { useState } from 'react';
import { Trash2, Edit2, Check, X, Save } from 'lucide-react';

const TaskItem = ({ task, onToggleComplete, onDeleteTask, onUpdateTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleSave = () => {
    if (!editedTitle.trim()) return;
    onUpdateTask(task._id, { title: editedTitle.trim() });
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditedTitle(task.title);
      setIsEditing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to visually categorize tasks dynamically based on keywords for aesthetic categorization
  const getCategoryDotClass = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('study') || lowerTitle.includes('learn') || lowerTitle.includes('assignment') || lowerTitle.includes('dbms') || lowerTitle.includes('exam')) {
      return 'dot-study';
    }
    if (lowerTitle.includes('career') || lowerTitle.includes('resume') || lowerTitle.includes('internship') || lowerTitle.includes('portfolio') || lowerTitle.includes('interview') || lowerTitle.includes('apply')) {
      return 'dot-career';
    }
    if (lowerTitle.includes('personal') || lowerTitle.includes('buy') || lowerTitle.includes('exercise') || lowerTitle.includes('clean') || lowerTitle.includes('call')) {
      return 'dot-personal';
    }
    return 'dot-general';
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-item-content">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task._id, !task.completed)}
          />
          <span className="checkmark"></span>
        </label>

        {isEditing ? (
          <input
            type="text"
            className="input-field"
            style={{ padding: '0.25rem 0.5rem', margin: 0, fontSize: '0.95rem' }}
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <>
            <span className={`category-dot ${getCategoryDotClass(task.title)}`} />
            <span className="task-title" title={task.title}>
              {task.title}
            </span>
          </>
        )}
      </div>

      <span className="task-date">{formatDate(task.createdAt)}</span>

      <div className="task-actions">
        {isEditing ? (
          <>
            <button className="btn-icon" onClick={handleSave} title="Save changes">
              <Check size={16} className="text-success" />
            </button>
            <button className="btn-icon" onClick={() => { setEditedTitle(task.title); setIsEditing(false); }} title="Cancel">
              <X size={16} className="text-danger" />
            </button>
          </>
        ) : (
          <>
            <button className="btn-icon" onClick={() => setIsEditing(true)} title="Edit task">
              <Edit2 size={16} />
            </button>
            <button className="btn-icon btn-icon-danger" onClick={() => onDeleteTask(task._id)} title="Delete task">
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
