import express, { Request, Response,NextFunction } from "express";
import jwt,{JwtPayload} from "jsonwebtoken";
import User from "../models/Userdata";
import "dotenv/config";
const router = express.Router();

//custom interface for requests with userId
interface AuthRequest extends Request {
  userId?: string;
}

//authorization token verification function
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

// Route to ftech user details with authorization token as middleware
router.get("/user-detail", verifyToken, async (req:AuthRequest, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).maxTimeMS(30000);
    if (user) {
      res.json({ success: true, Username: user.Username, email: user.email });
    }
  } catch (error) {
    // console.log(error);
  }
});
export default router;
