import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSignalR } from '../hooks/useSignalR';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { type Task, Priority, type CreateTaskRequest } from '../types';

export default function DashboardPage() {
  const { user, logoutUser }          = useAuth();
  const [tasks,   setTasks]           = useState<Task[]>([]);
  const [loading, setLoading]         = useState(true);
  const [title,   setTitle]           = useState('');
  const [desc,    setDesc]            = useState('');
  const [priority, setPriority]       = useState<Priority>(Priority.Medium);
  const [creating, setCreating]       = useState(false);

  // ── Load tasks on mount ─────────────────────────────────────────────────
  useEffect(() => {
    getTasks()
      .then(setTasks)
      .finally(() => setLoading(false));
  }, []);

  // ── SignalR handlers ────────────────────────────────────────────────────
  // useCallback prevents these from being recreated on every render
  const onTaskCreated = useCallback((task: Task) => {
    setTasks(prev => [task, ...prev]);  // add to top of list
  }, []);

  const onTaskUpdated = useCallback((task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
  }, []);

  const onTaskDeleted = useCallback(({ id }: { id: number }) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const { isConnected } = useSignalR({ onTaskCreated, onTaskUpdated, onTaskDeleted });

  // ── Create task ─────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);

    try {
      const req: CreateTaskRequest = { title, description: desc, priority };
      await createTask(req);
      // Don't manually add to list here — SignalR will push it back!
      setTitle('');
      setDesc('');
      setPriority(Priority.Medium);
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setCreating(false);
    }
  };

  // ── Toggle complete ─────────────────────────────────────────────────────
  const handleToggle = async (task: Task) => {
    try {
      await updateTask(task.id, {
        title:       task.title,
        description: task.description,
        isCompleted: !task.isCompleted,  // flip it
        priority:    task.priority,
        dueDate:     task.dueDate,
      });
      // SignalR will push the update back
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // ── Delete task ─────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id);
      // SignalR will push the deletion back
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const priorityLabel = (p: Priority) =>
    ({ [Priority.Low]: 'Low', [Priority.Medium]: 'Medium', [Priority.High]: 'High' }[p]);

  const priorityColor = (p: Priority) =>
    ({ [Priority.Low]: '#27ae60', [Priority.Medium]: '#e67e22', [Priority.High]: '#e74c3c' }[p]);

  return (
    <div style={styles.container}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>TaskFlow</h1>
          <p style={styles.welcome}>Welcome, {user?.fullName}</p>
        </div>
        <div style={styles.headerRight}>
          {/* SignalR live indicator */}
          <div style={styles.liveIndicator}>
            <div style={{
              ...styles.liveDot,
              backgroundColor: isConnected ? '#27ae60' : '#e74c3c'
            }} />
            <span style={styles.liveText}>
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
          </div>
          <button style={styles.logoutBtn} onClick={logoutUser}>Sign out</button>
        </div>
      </header>

      <div style={styles.main}>
        {/* ── Create Task Form ── */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>New task</h2>
          <form onSubmit={handleCreate} style={styles.form}>
            <input
              style={styles.input}
              placeholder="Task title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <input
              style={styles.input}
              placeholder="Description (optional)"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
            <div style={styles.row}>
              <select
                style={{ ...styles.input, flex: 1 }}
                value={priority}
                onChange={e => setPriority(Number(e.target.value) as Priority)}
              >
                <option value={Priority.Low}>Low priority</option>
                <option value={Priority.Medium}>Medium priority</option>
                <option value={Priority.High}>High priority</option>
              </select>
              <button style={styles.createBtn} type="submit" disabled={creating}>
                {creating ? 'Adding...' : '+ Add task'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Task List ── */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            Your tasks
            <span style={styles.taskCount}>{tasks.length}</span>
          </h2>

          {loading ? (
            <p style={styles.empty}>Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p style={styles.empty}>No tasks yet. Create one above!</p>
          ) : (
            <div style={styles.taskList}>
              {tasks.map(task => (
                <div key={task.id} style={{
                  ...styles.taskItem,
                  opacity: task.isCompleted ? 0.6 : 1,
                }}>
                  <div style={styles.taskLeft}>
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={() => handleToggle(task)}
                      style={styles.checkbox}
                    />
                    <div>
                      <p style={{
                        ...styles.taskTitle,
                        textDecoration: task.isCompleted ? 'line-through' : 'none',
                      }}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p style={styles.taskDesc}>{task.description}</p>
                      )}
                      <span style={{
                        ...styles.priorityBadge,
                        backgroundColor: priorityColor(task.priority) + '20',
                        color: priorityColor(task.priority),
                      }}>
                        {priorityLabel(task.priority)}
                      </span>
                    </div>
                  </div>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(task.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container:  { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  header:     { backgroundColor: 'white', padding: '1rem 2rem', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  logo:       { margin: 0, color: '#1E5FA8', fontSize: '1.5rem', fontWeight: 700 },
  welcome:    { margin: 0, color: '#666', fontSize: '0.875rem' },
  headerRight:{ display: 'flex', alignItems: 'center', gap: '1rem' },
  liveIndicator: { display: 'flex', alignItems: 'center', gap: '6px' },
  liveDot:    { width: '8px', height: '8px', borderRadius: '50%' },
  liveText:   { fontSize: '0.8rem', color: '#666', fontWeight: 500 },
  logoutBtn:  { padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid #ddd',
    background: 'transparent', cursor: 'pointer', color: '#666' },
  main:       { maxWidth: '700px', margin: '2rem auto', padding: '0 1rem',
    display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  card:       { backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  cardTitle:  { margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 600,
    color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  taskCount:  { backgroundColor: '#1E5FA8', color: 'white', fontSize: '0.75rem',
    padding: '2px 8px', borderRadius: '20px', fontWeight: 500 },
  form:       { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input:      { padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #e0e0e0',
    fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  row:        { display: 'flex', gap: '0.75rem', alignItems: 'stretch' },
  createBtn:  { padding: '0.65rem 1.25rem', backgroundColor: '#1E5FA8', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
    whiteSpace: 'nowrap', fontSize: '0.9rem' },
  taskList:   { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  taskItem:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #f0f0f0',
    backgroundColor: '#fafafa', transition: 'opacity 0.2s' },
  taskLeft:   { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 },
  checkbox:   { width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px',
    flexShrink: 0 },
  taskTitle:  { margin: '0 0 4px', fontWeight: 500, color: '#1a1a1a', fontSize: '0.95rem' },
  taskDesc:   { margin: '0 0 6px', color: '#888', fontSize: '0.82rem' },
  priorityBadge: { fontSize: '0.72rem', padding: '2px 8px', borderRadius: '20px',
    fontWeight: 600 },
  deleteBtn:  { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer',
    fontSize: '1rem', padding: '0 4px', flexShrink: 0 },
  empty:      { color: '#999', textAlign: 'center', padding: '2rem 0' },
};