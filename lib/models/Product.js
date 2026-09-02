import mongoose from "mongoose";

const OrderHistorySchema = new mongoose.Schema(
  {
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ["sale", "restock", "adjustment"],
      default: "sale",
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {_id: true}
);

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    dp: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    tp: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    orderHistory: {
      type: [OrderHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);