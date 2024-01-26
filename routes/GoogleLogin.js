import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/Userdata.js";
import "dotenv/config";
const router = express.Router();

router.post("/google-signup", async (req, res) => {
  const data = req.body.data;
  const Username = data.name;
  const email = data.email;
  try {
    await User.create({
      Username: Username,
      email: email,
    });

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
  } catch (error) {
    // console.log("Error creating user:", error);
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
    // console.error("Error creating user:", error);
    res.json({
      success: false,
    });
  }
});


export default router;