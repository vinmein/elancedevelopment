// Example model

const mongoose = require("mongoose");

const { Schema } = mongoose;
const shortid = require("shortid");

const profileSchema = new Schema(
  {
    profileId: {
      type: String,
      default: shortid.generate,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
    },
    claims: {
      type: Schema.Types.Mixed,
    },
    mobileNo: {
      type: String,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
    },
    type: {
      type: [String],
    },
    status: {
      type: String,
      default: "ACTIVE",
      enum: ["ACTIVE", "INACTIVE"],
    },
    profileUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

profileSchema.index({ profileId: 1 });

module.exports = mongoose.model("Profile", profileSchema);
