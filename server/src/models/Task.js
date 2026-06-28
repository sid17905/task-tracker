import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: ""
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },
    createdBy: {
      type: String,
      required: [true, "Creator is required"],
      trim: true,
      default: "Me",
      maxlength: [80, "Creator cannot exceed 80 characters"]
    },
    createdByEmail: {
      type: String,
      required: [true, "Creator email is required"],
      trim: true,
      lowercase: true,
      maxlength: [120, "Creator email cannot exceed 120 characters"]
    },
    assignedTo: {
      type: String,
      required: [true, "Assignee is required"],
      trim: true,
      default: "Me",
      maxlength: [80, "Assignee cannot exceed 80 characters"]
    },
    assignedToEmail: {
      type: String,
      required: [true, "Assignee email is required"],
      trim: true,
      lowercase: true,
      maxlength: [120, "Assignee email cannot exceed 120 characters"]
    },
    project: {
      type: String,
      trim: true,
      default: "Personal",
      maxlength: [80, "Project cannot exceed 80 characters"]
    },
    dueDate: {
      type: Date,
      validate: {
        validator(value) {
          if (!value) return true;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value >= today;
        },
        message: "Due date cannot be in the past"
      }
    },
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

taskSchema.index({
  title: "text",
  description: "text",
  assignedTo: "text",
  assignedToEmail: "text",
  createdBy: "text",
  createdByEmail: "text",
  project: "text"
});

export const Task = mongoose.model("Task", taskSchema);
