import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    content: {
      type: String,
      required: true,
    },

    featuredImage: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "dubai_real_estate_news",
        "market_trends",
        "investment_tips",
        "area_guides",
        "lifestyle",
        "property_management",
      ],
      default: "dubai_real_estate_news",
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
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

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ isActive: 1, status: 1 });
blogPostSchema.index({ isFeatured: 1, isActive: 1, status: 1 });

blogPostSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

blogPostSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const BlogPost = mongoose.model("BlogPost", blogPostSchema);
export default BlogPost;
