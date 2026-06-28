import { Search } from "lucide-react";

export default function FilterBar({ filters, onChange }) {
  const updateFilter = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <section className="filter-bar" aria-label="Task filters">
      <label className="search-field">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Search tasks"
        />
      </label>
      <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In progress</option>
        <option value="completed">Completed</option>
      </select>
      <select value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)}>
        <option value="all">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <select value={filters.sortBy} onChange={(event) => updateFilter("sortBy", event.target.value)}>
        <option value="createdAt">Created</option>
        <option value="dueDate">Due date</option>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
      </select>
      <select value={filters.order} onChange={(event) => updateFilter("order", event.target.value)}>
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </section>
  );
}
