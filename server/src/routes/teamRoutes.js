import { Router } from "express";
import { createTeamMember, deleteTeamMember, getTeamMembers } from "../controllers/teamController.js";
import { currentUser } from "../middleware/currentUser.js";

const router = Router();

router.route("/").get(currentUser, getTeamMembers).post(currentUser, createTeamMember);
router.route("/:id").delete(currentUser, deleteTeamMember);

export default router;
