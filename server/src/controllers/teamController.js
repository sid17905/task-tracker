import { TeamMember } from "../models/TeamMember.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getTeamMembers = async (req, res, next) => {
  try {
    const members = await TeamMember.find({ ownerEmail: req.user.email }).sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    next(error);
  }
};

export const createTeamMember = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const errors = {};

    if (!name) errors.name = "Name is required";
    if (!emailRegex.test(email)) errors.email = "Enter a valid email";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const member = await TeamMember.findOneAndUpdate(
      { ownerEmail: req.user.email, email },
      { ownerEmail: req.user.email, name, email },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
};

export const deleteTeamMember = async (req, res, next) => {
  try {
    const member = await TeamMember.findOneAndDelete({
      _id: req.params.id,
      ownerEmail: req.user.email
    });

    if (!member) return res.status(404).json({ message: "Team member not found" });
    res.json({ message: "Team member removed", id: req.params.id });
  } catch (error) {
    next(error);
  }
};
