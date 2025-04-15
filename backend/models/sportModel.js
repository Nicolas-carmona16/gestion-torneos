import mongoose from "mongoose";

const sportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    defaultRules: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

const Sport = mongoose.model("Sport", sportSchema);
export default Sport;
