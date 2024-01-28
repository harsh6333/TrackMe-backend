import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
  list: String,
  tasks: [],
});

export default mongoose.model("List", listSchema);
