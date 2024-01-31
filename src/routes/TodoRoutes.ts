import express, { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient, Prisma } from "@prisma/client";
import "dotenv/config";

const router = express.Router();
const prisma = new PrismaClient();


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



// Route to create a list and add tasks to a user's list with authorization token as middleware
router.post(
  "/add-to-list",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { tasklistbyId } = req.body;
      // console.log(tasklistbyId);

      const userId = parseInt(req.userId as string);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { lists: true }, 
      });

      if (!user) {
        return res.status(404).json({ errors: "User not found." });
      }

      for (const listName in tasklistbyId) {
        const existingList = user.lists.find(
          (list) => list.listname === listName
        );

        if (existingList) {
          // Update tasks within the existing list
          await prisma.list.update({
            where: { id: existingList.id },
            data: { tasks: { set: tasklistbyId[listName].tasks || [] } },
          });
        } else {
          // Create a new list if it doesn't exist
          const newList = {
            listname: listName,
            icon: tasklistbyId[listName].icon,
            tasks: tasklistbyId[listName].tasks || [],
            userId: user.id,
          };
          await prisma.list.create({ data: newList });
        }
      }

      res.json({ success: true });
    } catch (error) {
      // console.error(error);
      res.json({ success: false });
    }
  }
);




//route to fetch all lists of user
router.get(
  "/get-user-list",
  verifyToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.userId as string);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { lists: true }, // Include lists to avoid additional queries
      });

      if (!user) {
        return res.status(404).json({ errors: "User not found." });
      }

      // Return the user's lists
      res.json({ userlists: user.lists });
    } catch (error) {
      // console.error(error);
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
      const userId = parseInt(req.userId as string);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { lists: true },
      });

      if (!user) {
        return res.status(404).json({ errors: "User not found." });
      }

      // Find the list that needs to be updated
      const updatedListIndex = user.lists.findIndex(
        (list) => list.listname === listname
      );

      if (updatedListIndex !== -1) {
        const updatedTasks = user.lists[updatedListIndex].tasks.filter(
          (_, i) => i !== index
        ) as Prisma.JsonValue[];

        // Create a new list with the updated tasks
        const updatedList = {
          listname: listname,
          icon: user.lists[updatedListIndex].icon,
          tasks: updatedTasks,
          userId: userId,
        };

        await prisma.list.update({
          where: {
            id: user.lists[updatedListIndex].id,
          },
          data: updatedList as any,
        });
      }
      res.json({ success: true });
    } catch (error) {
      // console.error(error);
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
      const userId = parseInt(req.userId as string);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { lists: true },
      });

      if (!user) {
        return res.status(404).json({ errors: "User not found." });
      }

      // list to be deleted
      const listToDelete = user.lists.find(
        (list) => list.listname === listname
      );

      if (!listToDelete) {
        return res.status(404).json({ errors: "List not found." });
      }

      //delete list with prisma method
      await prisma.list.delete({
        where: { id: listToDelete.id },
      });

      res.json({ success: true });
    } catch (error) {
      // console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
