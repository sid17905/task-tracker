import { CheckCircle2, Clock3, ListTodo } from "lucide-react";

const statsConfig = [
  { key: "total", label: "Total", icon: ListTodo },
  { key: "inProgress", label: "In progress", icon: Clock3 },
  { key: "completed", label: "Done", icon: CheckCircle2 }
];

export default function Stats({ tasks }) {
  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((task) => task.status === "in-progress").length,
    completed: tasks.filter((task) => task.status === "completed").length
  };

  return (
    <section className="stats" aria-label="Task summary">
      {statsConfig.map(({ key, label, icon: Icon }) => (
        <div className="stat" key={key}>
          <Icon size={20} aria-hidden="true" />
          <span>{label}</span>
          <strong>{stats[key]}</strong>
        </div>
      ))}
    </section>
  );
}
