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


//function to check if db is connected or not
async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
  } finally {
    await prisma.$disconnect(); 
  }
}
checkDatabaseConnection();


//cors for backend and frontend communication
app.use(
  cors({
    origin: `${process.env.CLIENT_URL}`,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


//middleware to set headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", `${process.env.CLIENT_URL}`);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

//Incoming json parsing
app.use(express.json());

//api routes
app.use("/api", User);
app.use("/api", GoogleLogin);
app.use("/api", LoginRoutes);
app.use("/api", NotesRoutes);
app.use("/api", TodoRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
