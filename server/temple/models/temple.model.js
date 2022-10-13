// Example model

const mongoose = require("mongoose");
const shortid = require("shortid");

const { Schema } = mongoose;

const templeSchema = new Schema(
  {
    templeId: {
      type: String,
      default: shortid.generate,
      required: true,
    },
    templeCode: {
      type: String,
      required: true,
    },
    collectionId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "ACTIVE",
      enum: ["ACTIVE", "INACTIVE"],
    },
  },
  {
    timestamps: true,
  }
);

templeSchema.index({ templeCode: 1, collectionId: 1 }, { unique: true });

module.exports = mongoose.model("Temple", templeSchema);
