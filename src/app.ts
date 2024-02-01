import express from "express";
import cors from "cors";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import User from "./routes/User";
import GoogleLogin from "./routes/GoogleLogin";
import LoginRoutes from "./routes/LoginRoutes";
import NotesRoutes from "./routes/NotesRoutes";
import TodoRoutes from "./routes/TodoRoutes";

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();

// function to check if db is connected or not and run test
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$connect();
    console.log("Connected to the database");
    res.status(200).json({ message: "Connected to the database" });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    res.status(500).json({ message: "Failed to connect to the database" });
  } finally {
    // Disconnect from the database after the check
    await prisma.$disconnect();
  }
});

// CORS for backend and frontend communication
app.use(
  cors({
    origin: `${process.env.CLIENT_URL}`,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to set headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", `${process.env.CLIENT_URL}`);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// Incoming JSON parsing
app.use(express.json());

// API routes
app.use("/api", User);
app.use("/api", GoogleLogin);
app.use("/api", LoginRoutes);
app.use("/api", NotesRoutes);
app.use("/api", TodoRoutes);

// If the script is run directly, start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
