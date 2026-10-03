import mongoose from "mongoose";

const LedgerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    marketName: {
      type: String,
      required: true,
      trim: true,
    },

    ledgerDate: {
      type: Date,
      required: true,
    },

    createdBy: {
      type: String,
      required: true,
    },

    rows: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Ledger || mongoose.model("Ledger", LedgerSchema);
