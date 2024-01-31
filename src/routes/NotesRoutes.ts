import express, { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient} from "@prisma/client";
import "dotenv/config";

const router = express.Router();
const prisma = new PrismaClient();

// Custom interface for requests with userId
interface AuthRequest extends Request {
  userId?: string;
}

// Authorization token verification middleware
const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authToken = req.header("Authorization");

  if (!authToken) {
    return res.status(401).json({ errors: "Access denied. Please log in." });
  }

  try {
    const decoded = jwt.verify(
      authToken,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (typeof decoded === "string") {
      throw new Error("Invalid token structure.");
    }

    req.userId = decoded.user?.id;
    next();
  } catch (error) {
    res.status(400).json({ errors: "Invalid token." });
  }
};


//router to add and update notes with token verification middleware
router.post(
  "/add-notes",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    const { data } = req.body;
    const userId = parseInt(req.userId as string);

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { notes: { set: data } },
      });

      res.json({ success: true });
    } catch (error) {
      // console.error("Error updating user notes:", error);
      res.status(500).json({ errors: "Server error." });
    }
  }
);


//route get all users notes with token verification func. as middleware
router.get(
  "/get-notes",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.userId as string);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        return res.status(404).json({ errors: "User not found." });
      }

      res.json({ usernotes: user.notes });
    } catch (error) {
      // console.error("Error fetching user notes:", error);
      res.status(500).json({ errors: "Server error." });
    }
  }
);

//router to delete a user note
router.delete(
  "/delete-note",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { index } = req.body;
      const userId = parseInt(req.userId as string);

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ errors: "User not found." });
      }

      // Remove the note at that index
      user.notes.splice(index, 1);
      const newnotes = user.notes as any;
      await prisma.user.update({
        where: { id: userId },
        data: { notes: newnotes },
      });

      res.json({ success: true });
    } catch (error) {
      // console.error("Error deleting user note:", error);
      res.status(500).json({ errors: "Server error." });
    }
  }
);

export default router;
