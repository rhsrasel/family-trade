import mongoose from "mongoose";

const MarketSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {timestamps: true}
);

export default mongoose.models.Market || mongoose.model("Market", MarketSchema);