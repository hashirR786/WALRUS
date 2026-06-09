import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getSuggestions,
  askCoachQuestion,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Task CRUD routes - protected individually
router.route('/tasks')
  .get(protect, getTasks)
  .post(protect, createTask);

router.route('/tasks/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

// Smart Suggestions AI route - protected
router.route('/suggestions')
  .get(protect, getSuggestions);

// AI Coach Ask route - protected
router.route('/coach/ask')
  .post(protect, askCoachQuestion);

export default router;
