import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const TaskInput = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('general');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(title, { priority, category, dueDate });
    setTitle('');
    setPriority('medium');
    setCategory('general');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
      <div className="input-group task-input-main" style={{ marginBottom: 0 }}>
        <input
          type="text"
          className="input-field"
          placeholder="Add a new task (e.g., Study DBMS, Prepare Resume)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>

      <div className="task-input-meta">
        <select
          className="filter-select form-control-meta"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          title="Select task priority"
        >
          <option value="high">🔴 High Priority</option>
          <option value="medium">🟡 Medium Priority</option>
          <option value="low">⚪ Low Priority</option>
        </select>

        <select
          className="filter-select form-control-meta"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          title="Select task category"
        >
          <option value="general">General</option>
          <option value="work"> Work</option>
          <option value="study">Study</option>
          <option value="personal">Personal</option>
          <option value="career">Career</option>
        </select>

        <div className="date-input-wrapper form-control-meta">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>📅 Due:</span>
          <input
            type="date"
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-primary)', width: '100%', minWidth: '0' }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>
    </form>
  );
};

export default TaskInput;
