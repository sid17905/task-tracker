import { Task } from "../models/Task.js";
import { sendTaskAssignedEmail } from "../services/emailService.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildQuery = ({ status, priority, search, assignment }, userEmail) => {
  const query = {
    $or: [{ createdByEmail: userEmail }, { assignedToEmail: userEmail }]
  };

  if (status && status !== "all") query.status = status;
  if (priority && priority !== "all") query.priority = priority;
  if (assignment === "to-me") query.assignedToEmail = userEmail;
  if (assignment === "by-me") query.createdByEmail = userEmail;
  if (assignment === "self") {
    query.createdByEmail = userEmail;
    query.assignedToEmail = userEmail;
  }
  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      {
        $and: [
          { $or: [{ createdByEmail: userEmail }, { assignedToEmail: userEmail }] },
          {
            $or: [
              { title: { $regex: safeSearch, $options: "i" } },
              { description: { $regex: safeSearch, $options: "i" } },
              { assignedTo: { $regex: safeSearch, $options: "i" } },
              { assignedToEmail: { $regex: safeSearch, $options: "i" } },
              { createdBy: { $regex: safeSearch, $options: "i" } },
              { createdByEmail: { $regex: safeSearch, $options: "i" } },
              { project: { $regex: safeSearch, $options: "i" } }
            ]
          }
        ]
      }
    ];
  }

  return query;
};

const normalizeCreatePayload = (body, user) => {
  const assignedToEmail = String(body.assignedToEmail || user.email).trim().toLowerCase();
  const assignedTo = String(body.assignedTo || assignedToEmail).trim();

  const payload = {
    ...body,
    createdBy: user.name,
    createdByEmail: user.email,
    assignedTo,
    assignedToEmail,
    project: String(body.project || "Personal").trim() || "Personal",
    completedAt: body.status === "completed" ? new Date() : undefined
  };

  return payload;
};

const normalizeUpdatePayload = (body) => {
  const assignedToEmail = String(body.assignedToEmail || "").trim().toLowerCase();
  const update = {
    title: body.title,
    description: body.description,
    status: body.status,
    priority: body.priority,
    dueDate: body.dueDate,
    project: String(body.project || "Personal").trim() || "Personal",
    assignedTo: String(body.assignedTo || assignedToEmail).trim(),
    assignedToEmail
  };

  if (body.status === "completed") update.completedAt = new Date();
  if (body.status && body.status !== "completed") update.completedAt = null;

  Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);
  return update;
};

export const getTasks = async (req, res, next) => {
  try {
    const { sortBy = "createdAt", order = "desc" } = req.query;
    const allowedSortFields = ["createdAt", "updatedAt", "dueDate", "priority", "status", "title", "assignedTo", "createdBy"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const tasks = await Task.find(buildQuery(req.query, req.user.email)).sort({ [sortField]: sortOrder });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ createdByEmail: req.user.email }, { assignedToEmail: req.user.email }]
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await Task.create(normalizeCreatePayload(req.body, req.user));
    let emailStatus = { status: "not_needed" };
    if (task.assignedToEmail !== req.user.email) {
      try {
        emailStatus = await sendTaskAssignedEmail(task);
      } catch (error) {
        emailStatus = { status: "failed", message: error.message };
        console.error("Assignment email failed", error.message);
      }
    }
    res.status(201).json({ task, emailStatus });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const existingTask = await Task.findOne({
      _id: req.params.id,
      $or: [{ createdByEmail: req.user.email }, { assignedToEmail: req.user.email }]
    });

    if (!existingTask) return res.status(404).json({ message: "Task not found" });

    const isCreator = existingTask.createdByEmail === req.user.email;
    const update = isCreator ? normalizeUpdatePayload(req.body) : { status: req.body.status };
    if (!isCreator && req.body.status === "completed") update.completedAt = new Date();
    if (!isCreator && req.body.status && req.body.status !== "completed") update.completedAt = null;

    if (!isCreator && !req.body.status) {
      return res.status(403).json({ message: "Only the creator can edit task details" });
    }

    const previousAssignee = existingTask.assignedToEmail;
    const task = await Task.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    let emailStatus = { status: "not_needed" };
    if (isCreator && task.assignedToEmail !== previousAssignee && task.assignedToEmail !== req.user.email) {
      try {
        emailStatus = await sendTaskAssignedEmail(task);
      } catch (error) {
        emailStatus = { status: "failed", message: error.message };
        console.error("Assignment email failed", error.message);
      }
    }
    res.json({ task, emailStatus });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdByEmail: req.user.email
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully", id: req.params.id });
  } catch (error) {
    next(error);
  }
};
