import { useCallback, useEffect, useMemo, useState } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import {
  Bell,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Plus,
  Search,
  Settings,
  UsersRound,
  Zap
} from "lucide-react";
import { createTask, deleteTask, fetchTasks, updateTask } from "./api/tasks.js";
import { createTeamMember, deleteTeamMember, fetchTeamMembers } from "./api/team.js";
import { auth } from "./firebase.js";
import AuthPanel from "./components/AuthPanel.jsx";
import Notification from "./components/Notification.jsx";
import TaskForm from "./components/TaskForm.jsx";
import TaskList from "./components/TaskList.jsx";
import TeamPanel from "./components/TeamPanel.jsx";

const defaultFilters = {
  search: "",
  status: "all",
  priority: "all",
  assignment: "all",
  sortBy: "createdAt",
  order: "desc"
};

const navItems = [
  { key: "all", label: "All Tasks", icon: ListChecks },
  { key: "today", label: "Today", icon: Calendar },
  { key: "upcoming", label: "Upcoming", icon: Calendar },
  { key: "high", label: "High Priority", icon: Zap },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "team", label: "Team", icon: UsersRound },
  { key: "analytics", label: "Analytics", icon: LayoutDashboard }
];

const isToday = (date) => {
  if (!date) return false;
  const value = new Date(date);
  const today = new Date();
  return value.toDateString() === today.toDateString();
};

const isUpcoming = (date) => {
  if (!date) return false;
  const value = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return value > today;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [activeView, setActiveView] = useState("all");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [serverErrors, setServerErrors] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (!currentUser) {
        setTasks([]);
        setTeamMembers([]);
      }
    });

    return unsubscribe;
  }, []);

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
    window.clearTimeout(showNotification.timeoutId);
    showNotification.timeoutId = window.setTimeout(() => setNotification(null), 3200);
  }, []);

  const loadTasks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchTasks(user, filters);
      setTasks(data);
      setSelectedTaskId((current) => current || data[0]?._id || null);
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showNotification, user]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const loadTeamMembers = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchTeamMembers(user);
      setTeamMembers([
        {
          name: user.displayName || user.email.split("@")[0],
          email: user.email,
          isSelf: true
        },
        ...data
      ]);
    } catch (error) {
      showNotification(error.message, "error");
    }
  }, [showNotification, user]);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", isComposerOpen);
    return () => document.body.classList.remove("modal-open");
  }, [isComposerOpen]);

  const visibleTasks = useMemo(() => {
    if (activeView === "today") return tasks.filter((task) => isToday(task.dueDate));
    if (activeView === "upcoming") return tasks.filter((task) => isUpcoming(task.dueDate));
    if (activeView === "high") return tasks.filter((task) => task.priority === "high");
    if (activeView === "completed") return tasks.filter((task) => task.status === "completed");
    return tasks;
  }, [activeView, tasks]);

  const selectedTask = useMemo(
    () => visibleTasks.find((task) => task._id === selectedTaskId) || visibleTasks[0] || null,
    [selectedTaskId, visibleTasks]
  );

  useEffect(() => {
    if (selectedTask?._id && selectedTask._id !== selectedTaskId) {
      setSelectedTaskId(selectedTask._id);
    }
    if (!selectedTask && selectedTaskId) {
      setSelectedTaskId(null);
    }
  }, [selectedTask, selectedTaskId]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      inProgress: tasks.filter((task) => task.status === "in-progress").length,
      done: tasks.filter((task) => task.status === "completed").length
    }),
    [tasks]
  );

  const openComposer = (task = null) => {
    setEditingTask(task);
    setServerErrors({});
    setIsComposerOpen(true);
  };

  const closeComposer = () => {
    setEditingTask(null);
    setServerErrors({});
    setIsComposerOpen(false);
  };

  const handleSubmit = async (payload) => {
    try {
      setServerErrors({});
      if (editingTask) {
        const updated = await updateTask(user, editingTask._id, payload);
        setTasks((current) => current.map((task) => (task._id === updated._id ? updated : task)));
        setSelectedTaskId(updated._id);
        showNotification("Task updated");
        await loadTasks();
      } else {
        const created = await createTask(user, payload);
        setTasks((current) => [created, ...current]);
        setSelectedTaskId(created._id);
        showNotification(created.assignedToEmail === user.email ? "Task created" : "Task created and email notification queued");
      }
      closeComposer();
      return true;
    } catch (error) {
      setServerErrors(error.details || {});
      showNotification(error.message, "error");
      return false;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(user, id);
      setTasks((current) => current.filter((task) => task._id !== id));
      if (selectedTaskId === id) setSelectedTaskId(null);
      showNotification("Task deleted");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  const handleQuickComplete = async (task) => {
    try {
      const updated = await updateTask(user, task._id, { ...task, status: "completed" });
      setTasks((current) => current.map((item) => (item._id === updated._id ? updated : item)));
      setSelectedTaskId(updated._id);
      showNotification("Task completed");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  const handleSignIn = async (email, password) => {
    try {
      setAuthError("");
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSignUp = async (name, email, password) => {
    try {
      setAuthError("");
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
      setUser({ ...credential.user, displayName: name.trim() || credential.user.displayName });
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleAddMember = async (member) => {
    try {
      await createTeamMember(user, member);
      await loadTeamMembers();
      showNotification("Co-worker added");
      return true;
    } catch (error) {
      showNotification(error.message, "error");
      return false;
    }
  };

  const handleDeleteMember = async (id) => {
    try {
      await deleteTeamMember(user, id);
      await loadTeamMembers();
      showNotification("Co-worker removed");
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  if (!authReady) {
    return <main className="auth-shell"><div className="empty-state">Loading TaskPulse...</div></main>;
  }

  if (!user) {
    return <AuthPanel onSignIn={handleSignIn} onSignUp={handleSignUp} authError={authError} />;
  }

  const canManageSelectedTask = selectedTask?.createdByEmail === user.email;

  return (
    <main className="taskpulse-shell">
      <Notification notification={notification} onClose={() => setNotification(null)} />

      <aside className="side-nav">
        <div className="workspace-brand">
          <div className="logo-box">
            <Zap size={22} />
          </div>
          <div>
            <strong>TaskPulse</strong>
            <span>{user.email}</span>
          </div>
        </div>

        <button className="create-button" type="button" onClick={() => openComposer()}>
          <Plus size={18} />
          Create Task
        </button>

        <nav aria-label="Workspace views">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              className={activeView === key ? "active" : ""}
              key={key}
              type="button"
              onClick={() => setActiveView(key)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <div className="assignment-filter">
          <span>Assignment</span>
          <select value={filters.assignment} onChange={(event) => setFilters((current) => ({ ...current, assignment: event.target.value }))}>
            <option value="all">All directions</option>
            <option value="by-me">Assigned by me</option>
            <option value="to-me">Assigned to me</option>
            <option value="self">Me to me</option>
          </select>
        </div>

        <div className="side-footer">
          <button type="button">Help</button>
          <button type="button" onClick={() => signOut(auth)}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <section className="main-workspace">
        <header className="topbar">
          <label className="global-search">
            <Search size={18} />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search tasks, projects, or people..."
            />
          </label>
          <button type="button" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button type="button" aria-label="Settings">
            <Settings size={18} />
          </button>
          <div className="avatar">{(user.displayName || user.email).slice(0, 2).toUpperCase()}</div>
        </header>

        {activeView === "team" ? (
          <TeamPanel teamMembers={teamMembers} onAddMember={handleAddMember} onDeleteMember={handleDeleteMember} />
        ) : activeView === "analytics" ? (
          <section className="analytics-view">
            <p className="eyebrow">Analytics</p>
            <h1>Productivity Analytics</h1>
            <p className="muted">Real-time insights into your workspace performance.</p>
            <div className="chart-card">
              <div>
                <strong>7-Day Productivity Trend</strong>
                <span>Tasks completed over the last week</span>
              </div>
              <div className="fake-chart">
                <i style={{ height: "38%" }} />
                <i style={{ height: "54%" }} />
                <i style={{ height: "46%" }} />
                <i style={{ height: "72%" }} />
                <i style={{ height: "60%" }} />
                <i style={{ height: "82%" }} />
                <i style={{ height: "68%" }} />
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="stat-row">
              <article>
                <span>Total Tasks</span>
                <strong>{String(stats.total).padStart(2, "0")}</strong>
                <small>Live MongoDB count</small>
              </article>
              <article>
                <span>In Progress</span>
                <strong>{String(stats.inProgress).padStart(2, "0")}</strong>
                <div className="progress-line"><i style={{ width: `${Math.min(stats.inProgress * 18, 100)}%` }} /></div>
              </article>
              <article>
                <span>Done</span>
                <strong>{String(stats.done).padStart(2, "0")}</strong>
                <small>{stats.total ? Math.round((stats.done / stats.total) * 100) : 0}% completion rate</small>
              </article>
            </section>

            <section className="board-layout">
              <div className="task-board-panel">
                <div className="board-heading">
                  <div>
                    <h1>Live Task Board</h1>
                    <p>Track your active productivity flow</p>
                  </div>
                  <div className="board-tools">
                    <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}>
                      <option value="all">All priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select value={filters.sortBy} onChange={(event) => setFilters((current) => ({ ...current, sortBy: event.target.value }))}>
                      <option value="createdAt">Created</option>
                      <option value="dueDate">Due date</option>
                      <option value="priority">Priority</option>
                      <option value="assignedTo">Assignee</option>
                    </select>
                  </div>
                </div>
                <TaskList
                  loading={loading}
                  tasks={visibleTasks}
                  selectedTaskId={selectedTask?._id}
                  onSelect={setSelectedTaskId}
                  onQuickComplete={handleQuickComplete}
                />
              </div>

              <aside className="detail-panel">
                {selectedTask ? (
                  <>
                    <div className="detail-card">
                      <div className="detail-top">
                        <div>
                          <h2>{selectedTask.title}</h2>
                          <span className={`priority priority-${selectedTask.priority}`}>{selectedTask.priority} priority</span>
                        </div>
                      </div>
                      <div className="detail-meta">
                        <span>Due {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : "Not set"}</span>
                        <span>Assignee: {selectedTask.assignedToEmail}</span>
                        <span>{selectedTask.status.replace("-", " ")}</span>
                      </div>
                      <hr />
                      <h3>Description</h3>
                      <p>{selectedTask.description || "No description added yet."}</p>
                      <div className="people-grid">
                        <div><span>Created By</span><strong title={selectedTask.createdByEmail}>{selectedTask.createdByEmail}</strong></div>
                        <div><span>Assigned To</span><strong title={selectedTask.assignedToEmail}>{selectedTask.assignedToEmail}</strong></div>
                        <div><span>Project</span><strong>{selectedTask.project || "Personal"}</strong></div>
                      </div>
                      <div className="detail-actions">
                        {selectedTask.status !== "completed" && (
                          <button className="dark-button" type="button" onClick={() => handleQuickComplete(selectedTask)}>
                            <ClipboardCheck size={17} />
                            Mark as Done
                          </button>
                        )}
                        {canManageSelectedTask && <button type="button" onClick={() => openComposer(selectedTask)}>Edit Task</button>}
                        {canManageSelectedTask && <button className="delete-link" type="button" onClick={() => handleDelete(selectedTask._id)}>Delete</button>}
                      </div>
                    </div>
                    <div className="activity-box">
                      <div className="avatar small">{(user.displayName || user.email).slice(0, 2).toUpperCase()}</div>
                      <input placeholder="Add a comment..." />
                      <button type="button">Comment</button>
                    </div>
                  </>
                ) : (
                  <div className="empty-state">Select or create a task.</div>
                )}
              </aside>
            </section>
          </>
        )}
      </section>

      {isComposerOpen && (
        <div className="modal-backdrop" role="presentation">
          <TaskForm
            editingTask={editingTask}
            onCancel={closeComposer}
            onSubmit={handleSubmit}
            serverErrors={serverErrors}
            user={user}
            teamMembers={teamMembers}
          />
        </div>
      )}
    </main>
  );
}
