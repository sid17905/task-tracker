import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask
} from "../controllers/taskController.js";
import { currentUser } from "../middleware/currentUser.js";
import { validationMiddleware } from "../middleware/validateTask.js";

const router = Router();

router.route("/").get(currentUser, getTasks).post(currentUser, validationMiddleware(false), createTask);
router.route("/:id").get(currentUser, getTaskById).put(currentUser, validationMiddleware(true), updateTask).delete(currentUser, deleteTask);

export default router;
