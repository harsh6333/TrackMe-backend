import express, { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/Userdata";
import "dotenv/config";

const router = express.Router();

//custom interface for requests with userId
interface AuthRequest extends Request {
  userId?: string;
}

// Authorization token verification middleware
const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authToken = req.header("Authorization");

  // Check if token is missing
  if (!authToken) {
    return res.status(401).json({ errors: "Access denied. Please log in." });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(
      authToken,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Check for invalid token structure
    if (typeof decoded === "string") {
      throw new Error("Invalid token structure.");
    }

    // Set userId in request for later use
    req.userId = decoded.user?.id;
    next();
  } catch (error) {
    // Handle invalid token
    res.status(400).json({ errors: "Invalid token." });
  }
};

// Route to add tasks to a user's list with authorization token as middleware
router.post(
  "/add-to-list",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { tasklistbyId } = req.body;
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ errors: "User not found." });
      }

      if (!Array.isArray(user.lists)) {
        user.lists = [];
      }

      for (const listName in tasklistbyId) {
        const existingList = user.lists.find(
          (list) => list.listname === listName
        );

        if (existingList) {
          existingList.tasks = tasklistbyId[listName].tasks;
        } else {
          const newList = {
            listname: listName,
            icon: tasklistbyId[listName].icon,
            tasks: tasklistbyId[listName].tasks || [],
          };
          user.lists.push(newList);
        }
      }

      await user.save();

      res.json({ success: true });
    } catch (error) {
      res.json({ success: false });
    }
  }
);

// Route to get a user's lists
router.get(
  "/get-user-list",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      const user = await User.findById(userId).maxTimeMS(30000);

      if (!user) {
        return res.status(404).json({ errors: "User not found." });
      }

      // Return the user's cart data
      res.json({ userlists: user.lists });
    } catch (error) {
      res.status(500).json({ errors: "Server error." });
    }
  }
);

// Route to delete a task from a list
router.delete(
  "/tasks/:index",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { index, listname } = req.body;
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ errors: "User not found." });
      }

      user.lists.map((list) => {
        if (listname === list.listname) {
          list.tasks.splice(index, 1);
        }
      });

      await user.save();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ errors: "Server error." });
    }
  }
);

// Route to delete a list
router.delete(
  "/delete-list/:listname",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { listname } = req.params;
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ errors: "User not found." });
      }

      user.lists = user.lists.filter((list) => list.listname !== listname);
      await user.save();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
