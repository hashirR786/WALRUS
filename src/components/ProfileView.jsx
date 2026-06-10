import React, { useState } from 'react';
import { User as UserIcon, Camera, Trophy, Sparkles, CheckSquare, Target, Settings, Flame, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProfileView = ({ token, user, onUpdateUser, addToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user?.username || '');
  const [editedAvatar, setEditedAvatar] = useState(user?.avatar || 'walrus_classic');
  const [editedGoal, setEditedGoal] = useState(user?.dailyGoal || 3);
  const [editedCategory, setEditedCategory] = useState(user?.focusCategory || 'general');
  const [saving, setSaving] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Fetch tasks on render for statistics
  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_BASE}/tasks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to retrieve tasks');
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks for stats:', error);
      } finally {
        setLoadingTasks(false);
      }
    };
    if (token) {
      fetchTasks();
    }
  }, [token]);

  // Preset Avatar Background Colors (themed to match app design palette)
  const presets = [
    { id: 'walrus_classic', label: 'Classic Slate', color: '#8c826b' },
    { id: 'walrus_rose', label: 'Rose Amber', color: '#d99f59' },
    { id: 'walrus_amethyst', label: 'Amethyst', color: '#8b5cf6' },
    { id: 'walrus_emerald', label: 'Emerald', color: '#5f7560' },
    { id: 'walrus_terracotta', label: 'Terracotta', color: '#b05a5a' },
    { id: 'walrus_sapphire', label: 'Sapphire', color: '#4f46e5' },
  ];

  // Helper: check if avatar is a Base64 image
  const isBase64Avatar = (avatarStr) => {
    return avatarStr && avatarStr.startsWith('data:image/');
  };

  // Helper: get avatar background style
  const getAvatarStyle = (avatarId) => {
    if (isBase64Avatar(avatarId)) {
      return {};
    }
    const found = presets.find(p => p.id === avatarId);
    return { backgroundColor: found ? found.color : '#8c826b', color: '#ffffff' };
  };

  // Helper: Handle file upload and encode to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit to 1.5MB to prevent Mongoose payload size issues
    if (file.size > 1500000) {
      addToast('Image size exceeds limit. Please select an image under 1.5MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setEditedAvatar(uploadEvent.target.result); // Save Base64 String
      addToast('Custom avatar loaded! Click Save to apply.', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Handler: Save profile settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editedUsername.trim()) {
      addToast('Username cannot be empty', 'warning');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editedUsername.trim(),
          avatar: editedAvatar,
          dailyGoal: editedGoal,
          focusCategory: editedCategory,
        }),
      });

      if (!res.ok) throw new Error('Failed to update profile settings');
      const updatedUser = await res.json();
      
      onUpdateUser(updatedUser);
      setIsEditing(false);
      addToast('Profile dashboard updated!', 'success');
    } catch (error) {
      console.error(error);
      addToast(error.message || 'Error saving profile details', 'danger');
    } finally {
      setSaving(false);
    }
  };

  // --- STATS COMPUTATIONS ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Streak Calculation Algorithm: consecutive days with >= 1 task completed
  const calculateStreak = () => {
    const completedDates = tasks
      .filter(t => t.completed && t.completedAt)
      .map(t => new Date(t.completedAt).toDateString());

    const uniqueDates = [...new Set(completedDates)].map(d => new Date(d));
    
    if (uniqueDates.length === 0) return 0;

    // Sort descending (newest first)
    uniqueDates.sort((a, b) => b - a);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Verify recent activity
    let hasActivityRecent = uniqueDates.some(d => {
      const check = new Date(d);
      check.setHours(0, 0, 0, 0);
      return check.getTime() === today.getTime() || check.getTime() === yesterday.getTime();
    });

    if (!hasActivityRecent) return 0;

    let streak = 0;
    let currentStreakDate = today;

    // If they completed a task today, start checking from today. Otherwise start from yesterday.
    const hasToday = uniqueDates.some(d => {
      const check = new Date(d);
      check.setHours(0, 0, 0, 0);
      return check.getTime() === today.getTime();
    });
    if (!hasToday) {
      currentStreakDate = yesterday;
    }

    for (let i = 0; i < uniqueDates.length; i++) {
      const d = uniqueDates[i];
      const check = new Date(d);
      check.setHours(0, 0, 0, 0);

      if (check.getTime() === currentStreakDate.getTime()) {
        streak++;
        // Go back 1 day
        currentStreakDate.setDate(currentStreakDate.getDate() - 1);
      } else if (check.getTime() < currentStreakDate.getTime()) {
        // Gap in dates, streak is broken
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  if (loadingTasks) {
    return (
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', gap: '0.5rem', color: 'var(--text-secondary)' }}>
        <Loader2 className="spinner" size={24} />
        <span>Loading your profile stats...</span>
      </div>
    );
  }

  return (
    <div className="profile-grid">
      {/* LEFT COLUMN: User Card & Streak */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'stretch' }}>
        <section className="glass-panel profile-card">
          {/* Avatar Render */}
          <div className="profile-main-avatar" style={getAvatarStyle(isEditing ? editedAvatar : user?.avatar)}>
            {isBase64Avatar(isEditing ? editedAvatar : user?.avatar) ? (
              <img 
                src={isEditing ? editedAvatar : user?.avatar} 
                alt="Profile Avatar" 
                className="avatar-img-circle" 
              />
            ) : (
              <span>{(isEditing ? editedUsername : user?.username || 'W').charAt(0).toUpperCase()}</span>
            )}
          </div>

          <h2 className="profile-username-heading">{user?.username}</h2>
          <p className="profile-email-sub">{user?.email}</p>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Member Since: {new Date(user?.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>

          {/* Streak indicator */}
          <div className="streak-widget">
            <div className="streak-icon-container">
              <Flame className="streak-flame" size={24} />
            </div>
            <div className="streak-info">
              <div className="streak-count-text">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</div>
              <div className="streak-label-text">
                {currentStreak > 0 ? 'Conscious streak active! Keep going!' : 'Complete a task today to start your streak!'}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: Settings / Preferences */}
      <section className="glass-panel" style={{ minHeight: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
            <Settings size={20} className="text-primary" />
            <span>Profile Dashboard & Settings</span>
          </h2>
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            onClick={() => {
              if (isEditing) {
                // Cancel: reset fields
                setEditedUsername(user?.username || '');
                setEditedAvatar(user?.avatar || 'walrus_classic');
                setEditedGoal(user?.dailyGoal || 3);
                setEditedCategory(user?.focusCategory || 'general');
              }
              setIsEditing(!isEditing);
            }}
          >
            {isEditing ? 'Cancel' : 'Edit Preferences'}
          </button>
        </div>

        {/* STATS OVERVIEW PANEL */}
        {!isEditing && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Trophy size={14} className="text-warning" />
              Productivity Overview
            </h3>
            
            <div className="stats-card-row">
              <div className="stat-mini-card">
                <div className="stat-mini-value">{totalTasks}</div>
                <div className="stat-mini-label">Total Tasks</div>
              </div>
              <div className="stat-mini-card">
                <div className="stat-mini-value">{completedTasks}</div>
                <div className="stat-mini-label">Completed</div>
              </div>
              <div className="stat-mini-card">
                <div className="stat-mini-value">{completionRate}%</div>
                <div className="stat-mini-label">Completion Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS FORM */}
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* USERNAME INPUT */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Account Username
            </label>
            <input
              type="text"
              className="input-field"
              style={{ width: '100%', padding: '0.6rem 0.85rem' }}
              value={editedUsername}
              onChange={(e) => setEditedUsername(e.target.value)}
              disabled={!isEditing || saving}
              placeholder="Your Username"
            />
          </div>

          {/* AVATAR STYLE SELECTOR */}
          {isEditing && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Customize Avatar
              </label>

              {/* Color Presets */}
              <div className="avatar-select-grid">
                {presets.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`avatar-option-btn ${editedAvatar === p.id ? 'selected' : ''}`}
                    style={{ backgroundColor: p.color }}
                    onClick={() => setEditedAvatar(p.id)}
                    title={p.label}
                  >
                    🦦
                  </button>
                ))}
              </div>

              {/* Device Image Uploader */}
              <div style={{ marginTop: '0.5rem' }}>
                <label className="file-upload-label">
                  <Camera size={14} />
                  <span>Upload from Device</span>
                  <input
                    type="file"
                    className="file-input-hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          )}

          {/* PREFERENCES SETTINGS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* DAILY COMPLETION TARGET GOAL */}
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <span>Daily Completion Target</span>
                <span className="text-primary" style={{ fontWeight: 700 }}>{editedGoal} tasks</span>
              </label>
              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
                    value={editedGoal}
                    onChange={(e) => setEditedGoal(parseInt(e.target.value))}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <Target size={16} className="text-muted" />
                  <span>{user?.dailyGoal || 3} Tasks completed / day</span>
                </div>
              )}
            </div>

            {/* DEFAULT FOCUS CATEGORY */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Default Focus Category
              </label>
              {isEditing ? (
                <select
                  className="filter-select"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', height: '2.5rem' }}
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                >
                  <option value="general">📂 General</option>
                  <option value="work">💼 Work</option>
                  <option value="study">📚 Study</option>
                  <option value="personal">👤 Personal</option>
                  <option value="career">🚀 Career</option>
                </select>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', textTransform: 'capitalize' }}>
                  <CheckSquare size={16} className="text-muted" />
                  <span>{user?.focusCategory || 'General'}</span>
                </div>
              )}
            </div>
          </div>

          {/* SAVE CONTROLS (Only visible in editing mode) */}
          {isEditing && (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            >
              {saving ? (
                <>
                  <Loader2 className="spinner" size={16} />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Save Profile Dashboard</span>
                </>
              )}
            </button>
          )}
        </form>
      </section>
    </div>
  );
};

export default ProfileView;
