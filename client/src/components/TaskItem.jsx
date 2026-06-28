import { CalendarDays, UserRound } from "lucide-react";

const formatDate = (date, status) => {
  if (status === "completed") return "Completed";
  if (!date) return "No due date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
};

export default function TaskItem({ task, selected, onSelect, onQuickComplete }) {
  return (
    <article className={`task-row ${selected ? "selected" : ""} ${task.status === "completed" ? "is-done" : ""}`} onClick={() => onSelect(task._id)}>
      <button
        className="checkbox-button"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (task.status !== "completed") onQuickComplete(task);
        }}
        aria-label={`Mark ${task.title} complete`}
      >
        {task.status === "completed" ? "✓" : ""}
      </button>
      <div className="task-row-body">
        <div className="task-title-line">
          <h3>{task.title}</h3>
          <span className={`priority priority-${task.priority}`}>{task.priority}</span>
        </div>
        <p>{task.description || "No description added."}</p>
        <div className="task-row-meta">
          <span><CalendarDays size={14} /> {formatDate(task.dueDate, task.status)}</span>
          <span><UserRound size={14} /> {task.createdBy} to {task.assignedTo}</span>
        </div>
      </div>
    </article>
  );
}
