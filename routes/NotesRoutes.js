import express from "express";
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




router.post("/add-notes", verifyToken, async (req, res) => {
  const { data } = req.body;
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({ errors: "User not found." });
  }

  // Loop through the data array and push each object to the notes array
  user.notes = data;

  await user.save();

  res.json({ success: true });
});

router.get("/get-notes", verifyToken, async (req, res) => {
  try {
    // Get the user ID from token
    const userId = req.userId;

    // Find the user by their ID
    const user = await User.findById(userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    // Return the user's cart data
    res.json({ usernotes: user.notes });
  } catch (error) {
    // console.error("Error fetching user's cart data:", error);
    res.status(500).json({ errors: "Server error." });
  }
});
router.delete("/delete-note", verifyToken, async (req, res) => {
  try {
    const { index } = req.body;
    // Get the user ID from  token
    const userId = req.userId;

    // Find the user by their ID
    const user = await User.findById(userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }
    user.notes.splice(index, 1);
    await user.save();
  } catch (error) {
    // console.error("Error fetching user's cart data:", error);
    res.status(500).json({ errors: "Server error." });
  }
});

export default router;