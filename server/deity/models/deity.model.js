// Example model

const mongoose = require("mongoose");
const shortid = require("shortid");

const { Schema } = mongoose;

const deitySchema = new Schema(
  {
    deityId: {
      type: String,
      default: shortid.generate,
      required: true,
    },
    deityName: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
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
    archanai: {
      type: Array, // [7889149231363, 7889149231343]
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

deitySchema.index({ deityName: 1, templeCode: 1 }, { unique: true });

module.exports = mongoose.model("Deity", deitySchema);
