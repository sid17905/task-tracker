import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";

export default function TeamPanel({ teamMembers, onAddMember, onDeleteMember }) {
  const [form, setForm] = useState({ name: "", email: "" });

  const submit = async (event) => {
    event.preventDefault();
    const success = await onAddMember(form);
    if (success) setForm({ name: "", email: "" });
  };

  return (
    <section className="team-panel">
      <div>
        <p className="eyebrow">Team</p>
        <h2>Co-workers</h2>
        <p>Add Firebase account emails so tasks can be assigned to them.</p>
      </div>

      <form className="team-form" onSubmit={submit}>
        <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Name" required />
        <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="email@example.com" required />
        <button type="submit" aria-label="Add team member">
          <UserPlus size={16} />
        </button>
      </form>

      <div className="team-list">
        {teamMembers.map((member) => (
          <article key={member._id || member.email}>
            <div>
              <strong>{member.name}</strong>
              <span>{member.email}</span>
            </div>
            {!member.isSelf && (
              <button type="button" onClick={() => onDeleteMember(member._id)} aria-label={`Remove ${member.email}`}>
                <Trash2 size={15} />
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
