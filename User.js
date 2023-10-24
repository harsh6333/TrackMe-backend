import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/Userdata.js";
import "dotenv/config";
import { body, validationResult } from "express-validator";
const router = express.Router();

router.post(
  "/createuser",
  [
    body("email", "Please Enter valid Email").isEmail(),
    body("Username").isLength({ min: 5 }),
    body(
      "password",
      "Your Password should have atleasst 5 characters"
    ).isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const salt = await bcrypt.genSalt(10);
    let Password = await bcrypt.hash(req.body.password, salt);
    try {
      await User.create({
        Username: req.body.Username,
        email: req.body.email,
        password: Password,
      });
      console.log("user Created succesfully");
      res.json({
        success: true,
      });
    } catch {
      console.error("Error creating user:", error);
      res.json({
        success: false,
      });
    }
  }
);
router.post("/loginuser", async (req, res) => {
  let Username = req.body.Username;
  try {
    let UserData = await User.findOne({ Username }).maxTimeMS(30000);
    if (!UserData) {
      return res.status(400).json({ errors: "User Doesn't Exist" });
    }
    const pwdCompare = await bcrypt.compare(
      req.body.password,
      UserData.password
    );
    if (!pwdCompare) {
      return res.status(400).json({ errors: "Please Enter Correct Password" });
    }
    // console.log(UserData.id);
    const data = {
      user: {
        id: UserData.id,
      },
    };

    const authToken = jwt.sign(data, process.env.JWT_SECRET);
    return res.json({ success: true, authToken: authToken });
  } catch (error) {
    console.error("Error creating user:", error);
    res.json({
      success: false,
    });
  }
});

router.post("/google-signup", async (req, res) => {
  const data = req.body.data;
  const Username = data.name;
  const email = data.email;
  try {
    await User.create({
      Username: Username,
      email: email,
    });
    console.log("user Created succesfully");
    const newUser = await User.findOne({ Username });
    const data = {
      user: {
        id: newUser.id,
      },
    };
    const authToken = jwt.sign(data, process.env.JWT_SECRET);
    //  console.log(authToken);
    return res.json({
      success: true,
      authToken: authToken,
    });
    //  const userone = User.findOne({ Username });
    //  console.log(userone.id);
  } catch (error) {
    console.log("Error creating user:", error);
    res.json({
      success: false,
    });
  }
});

router.post("/google-login", async (req, res) => {
  // let Username = req.body.Username;
  const data = req.body.data;
  // console.log(data);
  const Username = data.name;
  try {
    let UserData = await User.findOne({ Username }).maxTimeMS(30000);
    if (!UserData) {
      return res.status(400).json({ errors: "User Doesn't Exist" });
    }
    const data = {
      user: {
        id: UserData.id,
      },
    };

    const authToken = jwt.sign(data, process.env.JWT_SECRET);
    return res.json({ success: true, authToken: authToken });
  } catch (error) {
    console.error("Error creating user:", error);
    res.json({
      success: false,
    });
  }
});

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

    // Find the user by ID
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    // Ensure 'lists' is an array
    if (!Array.isArray(user.lists)) {
      user.lists = [];
    }

    // For each list in tasklistbyId, update the tasks for existing lists or create new lists
    for (const listName in tasklistbyId) {
      const existingList = user.lists.find(
        (list) => list.listname === listName
      );

      if (existingList) {
        // Update the tasks of the existing list
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

    // Save the updated user
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error("Error adding tasks:", error);
    res.json({ success: false });
  }
});

router.get("/get-user-list", verifyToken, async (req, res) => {
  try {
    // Get the user ID from the verified token
    const userId = req.userId;

    // Find the user by their ID
    const user = await User.findById(userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    // Return the user's cart data
    res.json({ userlists: user.lists });
  } catch (error) {
    console.error("Error fetching user's cart data:", error);
    res.status(500).json({ errors: "Server error." });
  }
});

router.delete("/tasks/:index", verifyToken, async (req, res) => {
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
    console.error("Error deleting task from the database:", error);
    res.status(500).json({ errors: "Server error." });
  }
});
router.delete("/delete-list/:listname", verifyToken, async (req, res) => {
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
    console.log(error);
    // Handle the error appropriately
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/add-notes", verifyToken, async (req, res) => {
  const { data } = req.body;
  console.log(data);
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
    // Get the user ID from the verified token
    const userId = req.userId;

    // Find the user by their ID
    const user = await User.findById(userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }

    // Return the user's cart data
    res.json({ usernotes: user.notes });
  } catch (error) {
    console.error("Error fetching user's cart data:", error);
    res.status(500).json({ errors: "Server error." });
  }
});
router.delete("/delete-note", verifyToken, async (req, res) => {
  try {
    const { index } = req.body;
    // Get the user ID from the verified token
    const userId = req.userId;

    // Find the user by their ID
    const user = await User.findById(userId).maxTimeMS(30000);

    if (!user) {
      return res.status(404).json({ errors: "User not found." });
    }
    user.notes.splice(index, 1);
    await user.save();
  } catch (error) {
    console.error("Error fetching user's cart data:", error);
    res.status(500).json({ errors: "Server error." });
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
    console.log(error);
  }
});
export default router;
