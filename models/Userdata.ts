import mongoose, { Document } from "mongoose";

interface IList {
  listname: string;
  icon: string;
  tasks: any[];
}

interface IUser extends Document {
  Username: string;
  email: string;
  password?: string;
  lists: IList[];
  notes: any[];
}

const UserSchema = new mongoose.Schema<IUser>({
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

export default mongoose.model<IUser>("User", UserSchema);
