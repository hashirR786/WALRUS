import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle, Trash2 } from 'lucide-react';

const CalendarView = ({ tasks, onToggleComplete, onDeleteTask, onUpdateTask, loading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days in month calculation
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDayIndex = new Date(year, month, 1).getDay();

  // Create grid cells
  const cells = [];
  for (let i = 0; i < startDayIndex; i++) {
    cells.push({ type: 'empty', key: `empty-${i}` });
  }
  for (let day = 1; day <= totalDays; day++) {
    cells.push({ 
      type: 'day', 
      day, 
      date: new Date(year, month, day),
      key: `day-${day}` 
    });
  }

  // Helper to compare dates without times
  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Get tasks due on a specific day
  const getTasksForDay = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  const selectedDateTasks = getTasksForDay(selectedDate);
  const today = new Date();

  return (
    <div className="calendar-view-container">
      {/* Monthly Grid Card */}
      <div className="calendar-card">
        <div className="calendar-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} className="text-primary" />
            <span>{monthNames[month]} {year}</span>
          </h2>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="btn-icon" onClick={handlePrevMonth} title="Previous Month">
              <ChevronLeft size={20} />
            </button>
            <button className="btn-icon" onClick={handleNextMonth} title="Next Month">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {/* Weekday headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(h => (
            <div key={h} className="calendar-day-header">{h}</div>
          ))}

          {/* Grid cells */}
          {cells.map((cell) => {
            if (cell.type === 'empty') {
              return <div key={cell.key} className="calendar-day empty" />;
            }

            const dayTasks = getTasksForDay(cell.date);
            const isToday = isSameDay(cell.date, today);
            const isSelected = isSameDay(cell.date, selectedDate);

            // Separate priorities for dots display
            const hasHigh = dayTasks.some(t => t.priority === 'high' && !t.completed);
            const hasMed = dayTasks.some(t => t.priority === 'medium' && !t.completed);
            const hasLow = dayTasks.some(t => t.priority === 'low' && !t.completed);
            const allCompleted = dayTasks.length > 0 && dayTasks.every(t => t.completed);

            return (
              <div 
                key={cell.key} 
                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(cell.date)}
              >
                <span className="calendar-day-number">{cell.day}</span>
                {dayTasks.length > 0 && (
                  <div className="calendar-task-dots" title={`${dayTasks.length} tasks due`}>
                    {hasHigh && <span className="calendar-dot dot-high" />}
                    {hasMed && <span className="calendar-dot dot-medium" />}
                    {hasLow && <span className="calendar-dot dot-low" />}
                    {allCompleted && (
                      <span className="calendar-dot" style={{ backgroundColor: 'var(--success)' }} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Checklist Sidebar */}
      <div className="glass-panel" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Schedule for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </h3>

        {selectedDateTasks.length > 0 ? (
          <div className="task-list">
            {selectedDateTasks.map((task) => (
              <div 
                key={task._id} 
                className={`task-item ${task.completed ? 'completed' : ''}`}
                style={{ padding: '0.65rem 0.85rem' }}
              >
                <div className="task-item-content" style={{ gap: '0.5rem' }}>
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleComplete(task._id, !task.completed)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <span className="task-title" style={{ fontSize: '0.9rem' }} title={task.title}>
                    {task.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`priority-badge priority-${task.priority}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem' }}>
                    {task.priority}
                  </span>
                  <button 
                    className="btn-icon btn-icon-danger" 
                    onClick={() => onDeleteTask(task._id)}
                    title="Delete task"
                    style={{ width: '1.75rem', height: '1.75rem' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '3rem 1rem' }}>
            <AlertCircle size={36} className="text-muted" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>No tasks due today</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Select another date or add tasks with due dates to plan your time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
