import React, { useState } from 'react';
import TaskItem from './TaskItem';
import { Search, ListChecks } from 'lucide-react';

const TaskList = ({ tasks, onToggleComplete, onDeleteTask, onUpdateTask }) => {
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created'); // 'created', 'dueDate', 'priority'

  const getPriorityWeight = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 2;
    }
  };

  // 1. Filtering
  const filteredTasks = tasks
    .filter((task) => {
      if (filter === 'pending') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .filter((task) => {
      const matchQuery = searchQuery.toLowerCase();
      return task.title.toLowerCase().includes(matchQuery) ||
             (task.category && task.category.toLowerCase().includes(matchQuery));
    })
    .filter((task) => {
      if (priorityFilter === 'all') return true;
      return (task.priority || 'medium') === priorityFilter;
    })
    .filter((task) => {
      if (categoryFilter === 'all') return true;
      return (task.category || 'general') === categoryFilter;
    });

  // 2. Sorting
  const finalTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'priority') {
      return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
    }
    // Default: Sort by Created Date Descending (Newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="task-list-container">
      {/* Search Bar */}
      <div className="input-group" style={{ marginBottom: '0.75rem' }}>
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
            placeholder="Search tasks by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="filters-bar" style={{ marginBottom: '0.75rem' }}>
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

      {/* Advanced Filter Toolbar */}
      <div className="advanced-filters">
        <select 
          className="filter-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          title="Filter by Priority"
        >
          <option value="all">🔍 All Priorities</option>
          <option value="high">🔴 High Priority</option>
          <option value="medium">🟡 Medium Priority</option>
          <option value="low">⚪ Low Priority</option>
        </select>

        <select 
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          title="Filter by Category"
        >
          <option value="all">🔍 All Categories</option>
          <option value="general">📂 General</option>
          <option value="work">💼 Work</option>
          <option value="study">📚 Study</option>
          <option value="personal">👤 Personal</option>
          <option value="career">🚀 Career</option>
        </select>

        <select 
          className="filter-select filter-select-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          title="Sort Tasks"
        >
          <option value="created">📅 Sort by Created</option>
          <option value="dueDate">📅 Sort by Due Date</option>
          <option value="priority">⚡ Sort by Priority</option>
        </select>
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
              {searchQuery || priorityFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your search query or filters' 
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
