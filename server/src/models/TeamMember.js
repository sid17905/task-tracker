import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    ownerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: [120, "Email cannot exceed 120 characters"]
    }
  },
  { timestamps: true }
);

teamMemberSchema.index({ ownerEmail: 1, email: 1 }, { unique: true });

export const TeamMember = mongoose.model("TeamMember", teamMemberSchema);
