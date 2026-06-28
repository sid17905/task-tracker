import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";

const initialForm = {
  title: "",
  description: "",
  status: "pending",
  priority: "medium",
  dueDate: "",
  assignedToEmail: "",
  project: "Personal"
};

const getDateValue = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
};

const validate = (form) => {
  const errors = {};
  const title = form.title.trim();

  if (!title) errors.title = "Title is required";
  else if (title.length < 3) errors.title = "Use at least 3 characters";
  if (!form.assignedToEmail.trim()) errors.assignedToEmail = "Assignee is required";
  if (form.description.length > 500) errors.description = "Keep it under 500 characters";

  if (form.dueDate) {
    const selected = new Date(form.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) errors.dueDate = "Pick today or a future date";
  }

  return errors;
};

export default function TaskForm({ editingTask, onCancel, onSubmit, serverErrors, user, teamMembers }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || "",
        description: editingTask.description || "",
        status: editingTask.status || "pending",
        priority: editingTask.priority || "medium",
        dueDate: getDateValue(editingTask.dueDate),
        assignedToEmail: editingTask.assignedToEmail || user.email,
        project: editingTask.project || "Personal"
      });
    } else {
      setForm({ ...initialForm, assignedToEmail: user.email });
    }
    setErrors({});
  }, [editingTask, user.email]);

  useEffect(() => {
    setErrors((current) => ({ ...current, ...serverErrors }));
  }, [serverErrors]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      assignedTo: teamMembers.find((member) => member.email === form.assignedToEmail)?.name || form.assignedToEmail,
      assignedToEmail: form.assignedToEmail.trim().toLowerCase(),
      project: form.project.trim() || "Personal",
      dueDate: form.dueDate || undefined
    };

    setSubmitting(true);
    const success = await onSubmit(payload);
    if (!success) setSubmitting(false);
  };

  return (
    <form className="task-form modal-card" onSubmit={handleSubmit} noValidate>
      <div className="form-header">
        <div>
          <p className="eyebrow">Task details</p>
          <h2>{editingTask ? "Edit task" : "Create task"}</h2>
        </div>
        <button type="button" className="icon-button" onClick={onCancel} aria-label="Close task form" disabled={submitting}>
          <X size={18} />
        </button>
      </div>

      <label>
        Title
        <input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Finalize Q4 Revenue Report" maxLength={100} />
        {errors.title && <span className="error">{errors.title}</span>}
      </label>

      <label>
        Description
        <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Add useful task context" rows="4" maxLength={500} />
        {errors.description && <span className="error">{errors.description}</span>}
      </label>

      <div className="form-grid">
        <label>
          Created by
          <input value={`${user.displayName || user.email.split("@")[0]} (${user.email})`} disabled />
        </label>
        <label>
          Assigned to
          <select value={form.assignedToEmail} onChange={(event) => updateField("assignedToEmail", event.target.value)}>
            {teamMembers.map((member) => (
              <option key={member.email} value={member.email}>{member.name} - {member.email}</option>
            ))}
          </select>
          {errors.assignedToEmail && <span className="error">{errors.assignedToEmail}</span>}
        </label>
      </div>

      <div className="form-grid">
        <label>
          Status
          <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
            <option value="pending">Pending</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label>
          Priority
          <select value={form.priority} onChange={(event) => updateField("priority", event.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      <div className="form-grid">
        <label>
          Project
          <input value={form.project} onChange={(event) => updateField("project", event.target.value)} placeholder="Revenue Board" maxLength={80} />
        </label>
        <label>
          Due date
          <input type="date" value={form.dueDate} onChange={(event) => updateField("dueDate", event.target.value)} />
          {errors.dueDate && <span className="error">{errors.dueDate}</span>}
        </label>
      </div>

      <button className="primary-button" type="submit" disabled={submitting}>
        <Save size={18} aria-hidden="true" />
        {submitting ? "Saving..." : editingTask ? "Save changes" : "Add task"}
      </button>
    </form>
  );
}
