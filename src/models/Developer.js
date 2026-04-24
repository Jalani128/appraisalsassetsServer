import mongoose from "mongoose";

const developerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      default: "",
      maxlength: 220,
    },
    about: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "",
    },
    heroImage: {
      type: String,
      default: "",
    },
    focus: {
      type: String,
      default: "",
      maxlength: 180,
    },
    communities: {
      type: [String],
      default: [],
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      immutable: true,
    },
  },
  { timestamps: true },
);

developerSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

developerSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Developer = mongoose.model("Developer", developerSchema);
export default Developer;
