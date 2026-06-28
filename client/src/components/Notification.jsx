import { X } from "lucide-react";

export default function Notification({ notification, onClose }) {
  if (!notification) return null;

  return (
    <div className={`notification ${notification.type}`} role="status">
      <span>{notification.message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  );
}
