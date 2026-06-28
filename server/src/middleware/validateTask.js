const allowedStatuses = ["pending", "in-progress", "completed"];
const allowedPriorities = ["low", "medium", "high"];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateTaskPayload = (payload, isUpdate = false) => {
  const errors = {};

  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, "title")) {
    const title = String(payload.title || "").trim();
    if (!title) errors.title = "Title is required";
    else if (title.length < 3) errors.title = "Title must be at least 3 characters";
    else if (title.length > 100) errors.title = "Title cannot exceed 100 characters";
  }

  if (payload.description && String(payload.description).trim().length > 500) {
    errors.description = "Description cannot exceed 500 characters";
  }

  if (payload.status && !allowedStatuses.includes(payload.status)) {
    errors.status = "Invalid status";
  }

  if (payload.priority && !allowedPriorities.includes(payload.priority)) {
    errors.priority = "Invalid priority";
  }

  ["createdBy", "assignedTo", "project"].forEach((field) => {
    if (payload[field] && String(payload[field]).trim().length > 80) {
      errors[field] = "Keep this under 80 characters";
    }
  });

  if (payload.assignedToEmail && String(payload.assignedToEmail).trim().length > 120) {
    errors.assignedToEmail = "Keep this under 120 characters";
  }

  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, "assignedTo")) {
    if (!String(payload.assignedTo || "Me").trim()) errors.assignedTo = "Assignee is required";
  }

  if (!isUpdate || Object.prototype.hasOwnProperty.call(payload, "assignedToEmail")) {
    if (!emailRegex.test(String(payload.assignedToEmail || "").trim())) {
      errors.assignedToEmail = "Assignee email is required";
    }
  }

  if (payload.dueDate) {
    const dueDate = new Date(payload.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(dueDate.getTime())) {
      errors.dueDate = "Due date must be a valid date";
    } else if (dueDate < today) {
      errors.dueDate = "Due date cannot be in the past";
    }
  }

  return errors;
};

export const validationMiddleware = (isUpdate = false) => (req, res, next) => {
  const errors = validateTaskPayload(req.body, isUpdate);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  next();
};
