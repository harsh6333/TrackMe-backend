import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/Userdata.js";
import "dotenv/config";
const router = express.Router();

const verifyToken = (req, res, next) => {
  const authToken = req.header("Authorization");
  if (!authToken) {
    return res.status(401).json({ errors: "Access denied. Please log in." });
  }
  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

    req.userId = decoded.user.id;
    next();
  } catch (error) {
    res.status(400).json({ errors: "Invalid token." });
  }
};

router.post("/add-to-list", verifyToken, async (req, res) => {
  try {
    const { tasklistbyId } = req.body;

    // Finding the user by ID
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    // Making sure 'List' is an array
    if (!Array.isArray(user.lists)) {
      user.lists = [];
    }

    // For each list in tasklistbyId, updating the tasks for existing lists or creating new lists
    for (const listName in tasklistbyId) {
      const existingList = user.lists.find(
        (list) => list.listname === listName
      );

      if (existingList) {
        // Update the tasks of  existing list
        existingList.tasks = tasklistbyId[listName].tasks;
      } else {
        // Create a new list, even if no tasks are provided
        const newList = {
          listname: listName,
          icon: tasklistbyId[listName].icon,
          tasks: tasklistbyId[listName].tasks || [],
        };
        user.lists.push(newList);
      }
    }

    // Save updated user
    await user.save();

    res.json({ success: true });
  } catch (error) {
    // console.error("Error adding tasks:", error);
    res.json({ success: false });
  }
});
router.get("/user-detail", verifyToken, async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).maxTimeMS(30000);
    if (user) {
      res.json({ success: true, Username: user.Username, email: user.email });
    }
  } catch (error) {
    // console.log(error);
  }
});
export default router;