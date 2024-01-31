import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/google-signup", async (req: Request, res: Response) => {
  const data = req.body.data;
  const Username = data.name;
  const email = data.email;

  try {
    // Create a new user in the db using Prisma
    await prisma.user.create({
      data: {
        Username: Username,
        email: email,
      },
    });

    // Find the newly created user
    const newUser = await prisma.user.findFirst({
      where: { Username },
    });

    // Prepare user data for token creation
    const userData = {
      user: {
        id: newUser?.id.toString(),
      },
    };

    // Creating and assigning a JWT token
    const authToken = jwt.sign(userData, process.env.JWT_SECRET || "");

    return res.json({
      success: true,
      authToken: authToken,
    });
  } catch (error) {
    // console.error("Error creating user:", error);
    res.json({
      success: false,
    });
  }
});

router.post("/google-login", async (req: Request, res: Response) => {
  const data = req.body.data;
  const Username = data.name;

  try {
    // Find the user in db
    let userData = await prisma.user.findFirst({
      where: { Username },
    });

    // Check if user exists
    if (!userData) {
      return res.status(400).json({ errors: "User Doesn't Exist" });
    }

    //token creation
    const tokenData = {
      user: {
        id: userData?.id.toString(),
      },
    };

    // Create and assign the JWT token
    const authToken = jwt.sign(tokenData, process.env.JWT_SECRET || "");

    return res.json({ success: true, authToken: authToken });
  } catch (error) {
    // console.error("Error creating user:", error);
    res.json({
      success: false,
    });
  }
});

export default router;
