import React, { useState, useEffect } from 'react';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import Suggestions from '../components/Suggestions';
import Insights from '../components/Insights';
import { Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = ({ token, activeTab, addToast }) => {
  const [tasks, setTasks] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch tasks on initial render or when token changes
  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchSuggestions(true);
    }
  }, [token]);

  // API Call: Get all tasks
  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await fetch(`${API_BASE}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to retrieve tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
      addToast(error.message || 'Error loading tasks', 'danger');
    } finally {
      setLoadingTasks(false);
    }
  };

  // API Call: Fetch AI suggestions
  const fetchSuggestions = async (silent = false) => {
    try {
      setLoadingSuggestions(true);
      const res = await fetch(`${API_BASE}/suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to generate suggestions');
      const data = await res.json();
      setSuggestions(data);
      if (!silent) {
        addToast('AI recommendations updated successfully!', 'success');
      }
    } catch (error) {
      console.error(error);
      addToast('Could not fetch AI suggestions. Running in offline/fallback mode.', 'warning');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // API Call: Add new task
  const handleAddTask = async (title) => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create task');
      }
      const newTask = await res.json();
      
      // Update local state
      setTasks((prevTasks) => [newTask, ...prevTasks]);
      addToast(`Task "${title}" created!`, 'success');
    } catch (error) {
      console.error(error);
      addToast(error.message || 'Error creating task', 'danger');
    }
  };

  // API Call: Toggle task completion status
  const handleToggleComplete = async (id, completed) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updatedTask = await res.json();

      // Update state
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === id ? updatedTask : t))
      );
      
      addToast(
        completed ? 'Task marked as completed!' : 'Task set to pending',
        completed ? 'success' : 'info'
      );
    } catch (error) {
      console.error(error);
      addToast(error.message || 'Error updating task', 'danger');
    }
  };

  // API Call: Delete a task
  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete task');

      // Update state
      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== id));
      addToast('Task deleted successfully', 'success');
    } catch (error) {
      console.error(error);
      addToast(error.message || 'Error deleting task', 'danger');
    }
  };

  // API Call: Edit title in place
  const handleUpdateTask = async (id, updateData) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to rename task');
      const updatedTask = await res.json();

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === id ? updatedTask : t))
      );
      addToast('Task updated successfully', 'success');
    } catch (error) {
      console.error(error);
      addToast(error.message || 'Error updating task', 'danger');
    }
  };

  // Event Handler: Quick add from suggestions panel
  const handleAddSuggestedTask = async (title) => {
    await handleAddTask(title);
    
    // Clean suggestion from local suggestions listing so it doesn't duplicate
    if (suggestions) {
      const updatedSuggested = suggestions.suggested_tasks.filter(t => t !== title);
      const updatedMissing = suggestions.missing_tasks.filter(t => t !== title);
      
      setSuggestions({
        ...suggestions,
        suggested_tasks: updatedSuggested,
        missing_tasks: updatedMissing
      });
    }
  };

  if (activeTab === 'insights') {
    return (
      <main className="insights-grid">
        <Insights
          token={token}
          suggestions={suggestions}
          tasks={tasks}
          loading={loadingSuggestions}
        />
      </main>
    );
  }

  return (
    <main className="dashboard-grid">
      {/* Left panel: CRUD Tasks */}
      <section className="glass-panel" style={{ minHeight: '400px' }}>
        <h2>My Tasks</h2>
        
        <TaskInput onAddTask={handleAddTask} />
        
        {loadingTasks ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '0.5rem', color: 'var(--text-secondary)' }}>
            <Loader2 className="spinner" size={24} />
            <span>Loading your tasks...</span>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
        )}
      </section>

      {/* Right panel: AI Suggestions */}
      <Suggestions
        suggestions={suggestions}
        loading={loadingSuggestions}
        onRefresh={() => fetchSuggestions(false)}
        onAddSuggestedTask={handleAddSuggestedTask}
      />
    </main>
  );
};

export default Dashboard;
