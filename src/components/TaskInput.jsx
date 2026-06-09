import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const TaskInput = ({ onAddTask }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddTask(title);
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className="input-group">
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
    </form>
  );
};

export default TaskInput;
