// Example model

const mongoose = require("mongoose");

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    templeCode: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    tags: {
      type: Array,
    },
    isServices: {
      type: Boolean,
      required: true,
    },
    isArchanai: {
      type: Boolean,
      required: true,
    },
    deities: {
      type: Array,
      required: true,
    },
    product: {
      type: Schema.Types.Mixed,
      required: true,
    },
    weight: {
      type: String,
      required: true,
    },
    variant: {
      type: Schema.Types.Mixed,
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

productSchema.index({ productId: 1, templeCode: 1 }, { unique: true });

module.exports = mongoose.model("product", productSchema);
