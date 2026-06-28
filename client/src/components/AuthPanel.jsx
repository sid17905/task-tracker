import { useState } from "react";
import { LogIn, UserPlus, Zap } from "lucide-react";

export default function AuthPanel({ onSignIn, onSignUp, authError }) {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = (event) => {
    event.preventDefault();
    if (mode === "signin") onSignIn(form.email, form.password);
    else onSignUp(form.name, form.email, form.password);
  };

  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand">
          <div className="logo-box"><Zap size={22} /></div>
          <div>
            <strong>TaskPulse</strong>
            <span>Sign in to assign tasks by email</span>
          </div>
        </div>

        <div className="auth-tabs">
          <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>
            <LogIn size={16} /> Sign in
          </button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
            <UserPlus size={16} /> Sign up
          </button>
        </div>

        {mode === "signup" && (
          <label>
            Name
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Your name" />
          </label>
        )}

        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" required />
        </label>

        <label>
          Password
          <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="At least 6 characters" required />
        </label>

        {authError && <span className="error">{authError}</span>}

        <button className="primary-button" type="submit">
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </main>
  );
}
