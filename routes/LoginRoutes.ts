import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Userdata";
import "dotenv/config";
import { body, validationResult } from "express-validator";
const router = express.Router();

router.post(
  "/createuser",
  //validatin user send inputs
  [
    body("email", "Please Enter valid Email").isEmail(),
    body("Username", "Username Should have at least 5 characters").isLength({
      min: 5,
    }),
    body(
      "password",
      "Your Password should have at least 5 characters"
    ).isLength({
      min: 5,
    }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user already exists by username
      const existingUser = await User.findOne({ Username: req.body.Username });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User already exists with this username" });
      }

      // If user doesn't exist, proceed with user creation
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(req.body.password, salt);

      await User.create({
        Username: req.body.Username,
        email: req.body.email,
        password: passwordHash,
      });

      res.json({
        success: true,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.json({
        success: false,
      });
    }
  }
);

router.post("/loginuser", async (req: Request, res: Response) => {
  let Username = req.body.Username;
  try {
    let UserData = await User.findOne({ Username }).maxTimeMS(30000);
    if (!UserData) {
      return res.status(400).json({ error: "User Doesn't Exist" });
    }
    //checking if password is correct or not
    const pwdCompare = bcrypt.compare(
      req.body.password,
      UserData.password as string
    );
    if (!pwdCompare) {
      return res.status(400).json({ error: "Please Enter Correct Password" });
    }

    const data = {
      user: {
        id: UserData.id,
      },
    };
    const authToken = jwt.sign(data, process.env.JWT_SECRET || "");
    return res.json({ success: true, authToken: authToken });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
