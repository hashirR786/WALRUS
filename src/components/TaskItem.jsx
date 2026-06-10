import React, { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';

const TaskItem = ({ task, onToggleComplete, onDeleteTask, onUpdateTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedPriority, setEditedPriority] = useState(task.priority || 'medium');
  const [editedCategory, setEditedCategory] = useState(task.category || 'general');
  const [editedDueDate, setEditedDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );

  const handleSave = () => {
    if (!editedTitle.trim()) return;
    onUpdateTask(task._id, { 
      title: editedTitle.trim(),
      priority: editedPriority,
      category: editedCategory,
      dueDate: editedDueDate || null
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      resetFields();
      setIsEditing(false);
    }
  };

  const resetFields = () => {
    setEditedTitle(task.title);
    setEditedPriority(task.priority || 'medium');
    setEditedCategory(task.category || 'general');
    setEditedDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const isOverdue = (dueDateString) => {
    if (!dueDateString || task.completed) return false;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const getCategoryClass = (category) => {
    const cat = category ? category.toLowerCase() : 'general';
    return `cat-${cat}`;
  };

  const getPriorityClass = (priority) => {
    const pri = priority ? priority.toLowerCase() : 'medium';
    return `priority-${pri}`;
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`} style={{ minHeight: '65px' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: 0 }}>
            <input
              type="text"
              className="input-field"
              style={{ padding: '0.25rem 0.5rem', margin: 0, fontSize: '0.9rem' }}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div className="edit-pickers">
              <select
                className="edit-select"
                value={editedPriority}
                onChange={(e) => setEditedPriority(e.target.value)}
                title="Priority"
              >
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">⚪ Low</option>
              </select>

              <select
                className="edit-select"
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
                title="Category"
              >
                <option value="general">📂 General</option>
                <option value="work">💼 Work</option>
                <option value="study">📚 Study</option>
                <option value="personal">👤 Personal</option>
                <option value="career">🚀 Career</option>
              </select>

              <input
                type="date"
                className="edit-date-input"
                value={editedDueDate}
                onChange={(e) => setEditedDueDate(e.target.value)}
                title="Due Date"
              />
            </div>
          </div>
        ) : (
          <>
            <span className={`category-dot dot-${task.category || 'general'}`} />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
              <span className="task-title" title={task.title}>
                {task.title}
              </span>
              <div className="task-metadata">
                <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                  {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '⚪'} {task.priority || 'medium'}
                </span>
                <span className={`category-badge ${getCategoryClass(task.category)}`}>
                  {task.category || 'general'}
                </span>
                {task.dueDate && (
                  <span className={`task-date-badge ${isOverdue(task.dueDate) ? 'overdue' : ''}`} title="Due Date">
                    📅 {formatDueDate(task.dueDate)} {isOverdue(task.dueDate) && '(Overdue)'}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <span className="task-date" title="Task Created Date">{formatDate(task.createdAt)}</span>

      <div className="task-actions">
        {isEditing ? (
          <>
            <button className="btn-icon" onClick={handleSave} title="Save changes">
              <Check size={16} className="text-success" />
            </button>
            <button className="btn-icon" onClick={() => { resetFields(); setIsEditing(false); }} title="Cancel">
              <X size={16} className="text-danger" />
            </button>
          </>
        ) : (
          <>
            <button className="btn-icon" onClick={() => setIsEditing(true)} title="Edit task details">
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
