import Task from '../models/Task.js';
import { generateSuggestions, askCoach } from '../services/groqService.js';

// @desc    Get all tasks for logged-in user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving tasks', error: error.message });
  }
};

// @desc    Create a new task for logged-in user
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const { title, dueDate, priority, category } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const newTask = await Task.create({
      user: req.user.id,
      title: title.trim(),
      dueDate: dueDate || null,
      priority: priority || 'medium',
      category: category || 'general',
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

// @desc    Update a task (toggle completion or change title) owned by user
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed, dueDate, priority, category } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completedAt = completed ? new Date() : null;
    }
    if (dueDate !== undefined) updateData.dueDate = dueDate || null;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;

    // findOneAndUpdate ensures the task belongs to the authenticated user
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

// @desc    Delete a task owned by user
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // findOneAndDelete ensures the task belongs to the authenticated user
    const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user.id });

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found or unauthorized' });
    }

    res.status(200).json({ message: 'Task deleted successfully', id });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};

// @desc    Get AI-powered task suggestions for user
// @route   GET /api/suggestions
// @access  Private
export const getSuggestions = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    const suggestions = await generateSuggestions(tasks);
    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Error generating AI suggestions', error: error.message });
  }
};

// @desc    Ask AI Coach a question regarding user's tasks
// @route   POST /api/coach/ask
// @access  Private
export const askCoachQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const tasks = await Task.find({ user: req.user.id });
    const advice = await askCoach(question, tasks);
    res.status(200).json({ advice });
  } catch (error) {
    res.status(500).json({ message: 'Error querying AI Coach', error: error.message });
  }
};
