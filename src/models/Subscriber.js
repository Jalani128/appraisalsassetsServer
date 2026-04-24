import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    source: {
      type: String,
      enum: ["newsletter", "inquiry", "manual", "website"],
      default: "newsletter",
      index: true,
    },

    interests: {
      type: [String],
      enum: ["buying", "renting", "investing", "valuation", "off_plan"],
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "inactive", "unsubscribed"],
      default: "active",
      index: true,
    },

    notes: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

subscriberSchema.index({ status: 1, createdAt: -1 });
subscriberSchema.index({ source: 1, status: 1 });

subscriberSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

subscriberSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Subscriber = mongoose.model("Subscriber", subscriberSchema);
export default Subscriber;
