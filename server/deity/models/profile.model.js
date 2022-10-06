// Example model

const mongoose = require("mongoose");
const shortid = require("shortid");

const { Schema } = mongoose;

const profileSchema = new Schema(
  {
    deityId: {
      type: String,
      default: shortid.generate,
      required: true,
    },
    deityName: {
      type: String,
      required: true,
      unique: true,
    },
    templeCode: {
      type: String,
      required: true,
    },
    archanai: {
      type: [String], // [7889149231363, 7889149231343]
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
      type: String,
      required: true,
      enum: ["DOCTOR", "VISITOR", "ADMIN", "ROOT"],
    },
    meta: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      default: "ACTIVE",
      enum: ["ACTIVE", "INACTIVE"],
    },
    aboutYouSelf: {
      height: {
        type: String,
      },
      weight: {
        type: String,
      },
      foodHabits: {
        type: Array,
      },
      allergyTo: {
        type: String,
      },
    },
    country: {
      type: String,
      default: "IN",
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
