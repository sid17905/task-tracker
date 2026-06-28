import { Inbox } from "lucide-react";
import TaskItem from "./TaskItem.jsx";

export default function TaskList({ loading, tasks, selectedTaskId, onSelect, onQuickComplete }) {
  if (loading) return <div className="empty-state">Loading tasks...</div>;

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <Inbox size={36} aria-hidden="true" />
        <strong>No tasks found</strong>
        <span>Create a task or adjust the filters.</span>
      </div>
    );
  }

  return (
    <section className="task-list" aria-label="Tasks">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          selected={selectedTaskId === task._id}
          onSelect={onSelect}
          onQuickComplete={onQuickComplete}
        />
      ))}
    </section>
  );
}
