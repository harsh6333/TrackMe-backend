import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import User from "./User.js";
const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: `${process.env.CLIENT_URL}`,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", `${process.env.CLIENT_URL}`);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

async function connectToDatabase() {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.xrynsi5.mongodb.net/Todo`
    );

    console.log("Connected to MongoDB");
  } catch (error) {
    // console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

app.use(express.json());
app.use("/api", User);

connectToDatabase()
  .then(() => {})
  .catch((error) => {
    // console.error("Error starting the server:", error);
  });
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
