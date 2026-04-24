import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    inquiry_type: {
      type: String,
      enum: ["general", "viewing", "valuation", "investment"],
      default: "general",
    },
    property_title: {
      type: String,
      trim: true,
    },
    property_reference: {
      type: String,
      trim: true,
    },
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "follow-up", "closed"],
      default: "new",
    },
    source: {
      type: String,
      default: "Website",
    },
    notes: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// Add virtual id field
inquirySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

inquirySchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = doc._id.toHexString();
    return ret;
  },
});

export default mongoose.model("Inquiry", inquirySchema);
