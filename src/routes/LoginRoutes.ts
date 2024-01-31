import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { z, ZodError } from "zod";
import "dotenv/config";

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema using zod
const createUserSchema = z.object({
  email: z.string().email(),
  Username: z.string().min(5),
  password: z.string().min(5),
});

router.post("/createuser", async (req: Request, res: Response) => {
  try {
    const userInput = createUserSchema.parse(req.body);

    // Checking if user already exists by username
    const existingUser = await prisma.user.findFirst({
      where: { Username: userInput.Username },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists with this username" });
    }

    // If user doesn't exist, proceed with user creation
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userInput.password, salt);

    await prisma.user.create({
      data: {
        Username: userInput.Username,
        email: userInput.email,
        password: passwordHash,
      },
    });

    res.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      // zod validation errors
      const errorMessage = error.errors.map((e) => e.message).join(", ");
      return res.status(400).json({ errors: errorMessage });
    }

    // console.error("Error creating user:", error);
    res.json({
      success: false,
    });
  }
});

// Validation schema for login using zod
const loginUserSchema = z.object({
  Username: z.string(),
  password: z.string().min(5),
});

router.post("/loginuser", async (req: Request, res: Response) => {
  try {
    const loginInput = loginUserSchema.parse(req.body);

    let userData = await prisma.user.findFirst({
      where: { Username: loginInput.Username },
    });

    if (!userData) {
      return res.status(400).json({ error: "User Doesn't Exist" });
    }

    // checking if the password is correct or not
    const pwdCompare = await bcrypt.compare(
      loginInput.password,
      userData.password as string
    );

    if (!pwdCompare) {
      return res.status(400).json({ error: "Please Enter Correct Password" });
    }

    const data = {
      user: {
        id: userData.id.toString(),
      },
    };
    const authToken = jwt.sign(data, process.env.JWT_SECRET || "");
    return res.json({ success: true, authToken: authToken });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
