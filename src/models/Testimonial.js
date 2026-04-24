import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    clientRole: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    clientCompany: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    testimonialText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },

    clientImage: {
      type: String,
      trim: true,
    },

    propertyType: {
      type: String,
      enum: ["sale", "rent", "valuation", "investment"],
      default: "sale",
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
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
  {
    timestamps: true,
  },
);

// Indexes for fast queries
testimonialSchema.index({ isActive: 1, createdAt: -1 });
testimonialSchema.index({ isFeatured: 1, isActive: 1 });

// Virtual for frontend compatibility
testimonialSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
testimonialSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Testimonial = mongoose.model("Testimonial", testimonialSchema);
export default Testimonial;
