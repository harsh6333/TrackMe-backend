import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  Username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: false,
  },
  lists: [
    {
      listname: String,
      icon: String, 
      tasks: [],
    },
  ],
  notes: [],
});

export default mongoose.model("User", UserSchema);
