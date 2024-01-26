import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/Userdata.js";
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
      // console.log("user Created succesfully");
      res.json({
        success: true,
      });
    } catch {
      // console.error("Error creating user:", error);
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
    // console.error("Error creating user:", error);
    res.json({
      success: false,
    });
  }
});


export default router;