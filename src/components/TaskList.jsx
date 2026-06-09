import React, { useState } from 'react';
import TaskItem from './TaskItem';
import { Search, ListChecks } from 'lucide-react';

const TaskList = ({ tasks, onToggleComplete, onDeleteTask, onUpdateTask }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filter by status
  const statusFiltered = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // 2. Filter by search query
  const finalTasks = statusFiltered.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="task-list-container">
      {/* Search and Filter Row */}
      <div className="filters-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
        
        <span className="task-count">
          {finalTasks.length} {finalTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Task Search Bar */}
      <div className="input-group" style={{ marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search 
            size={18} 
            className="text-muted" 
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} 
          />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="task-list">
        {finalTasks.length > 0 ? (
          finalTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDeleteTask={onDeleteTask}
              onUpdateTask={onUpdateTask}
            />
          ))
        ) : (
          <div className="empty-state">
            <ListChecks size={48} className="empty-state-icon" style={{ strokeWidth: 1.5 }} />
            <p style={{ fontWeight: 500 }}>No tasks found</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {searchQuery 
                ? 'Try adjusting your search criteria' 
                : filter === 'completed' 
                  ? 'Keep working to complete your tasks!' 
                  : 'Get started by typing a task above!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
