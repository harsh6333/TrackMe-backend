import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/Userdata";
import "dotenv/config";

const router = express.Router();

// Route for the first-time signup using Google
router.post("/google-signup", async (req: Request, res: Response) => {
  const data = req.body.data;
  const Username = data.name;
  const email = data.email;

  try {
    // Create a new user in the database
    await User.create({
      Username: Username,
      email: email,
    });

    // Find the newly created user
    const newUser = await User.findOne({ Username });

    // Prepare user data for token creation
    const userData = {
      user: {
        id: newUser?.id,
      },
    };

    // Create and sign a JWT token
    const authToken = jwt.sign(userData, process.env.JWT_SECRET || "");

    return res.json({
      success: true,
      authToken: authToken,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.json({
      success: false,
    });
  }
});

// Route for Google login
router.post("/google-login", async (req: Request, res: Response) => {
  const data = req.body.data;
  const Username = data.name;

  try {
    // Find the user in the database
    let userData = await User.findOne({ Username }).maxTimeMS(30000);

    // Check if the user exists
    if (!userData) {
      return res.status(400).json({ errors: "User Doesn't Exist" });
    }

    // Prepare user data for token creation
    const tokenData = {
      user: {
        id: userData?.id,
      },
    };

    // Create and sign a JWT token
    const authToken = jwt.sign(tokenData, process.env.JWT_SECRET || "");

    return res.json({ success: true, authToken: authToken });
  } catch (error) {
    console.error("Error creating user:", error);
    res.json({
      success: false,
    });
  }
});

export default router;
