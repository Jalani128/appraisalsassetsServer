import BlogPost from "../models/BlogPost.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureUniqueSlug(slug, excludeId = null) {
  let uniqueSlug = slug;
  let counter = 1;
  while (true) {
    const query = { slug: uniqueSlug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await BlogPost.findOne(query);
    if (!existing) return uniqueSlug;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
}

// CREATE BLOG POST
export const createBlogPost = async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, tags, status, isFeatured } =
      req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).json({
        success: false,
        message: "Please provide title, excerpt, and content",
      });
    }

    const finalSlug = await ensureUniqueSlug(
      slug && slug.trim() ? generateSlug(slug) : generateSlug(title),
    );

    let imageUrl = "";
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.path, "blog");
        if (uploadResult && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
      }
    }

    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : tags;
    }

    const blogPost = new BlogPost({
      title,
      slug: finalSlug,
      excerpt,
      content,
      featuredImage: imageUrl,
      category: category || "dubai_real_estate_news",
      tags: parsedTags,
      status: status || "draft",
      publishedAt: status === "published" ? new Date() : null,
      isFeatured: isFeatured === "true" || isFeatured === true,
      createdBy: req.admin.id,
    });

    await blogPost.save();

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: blogPost,
    });
  } catch (error) {
    console.error("Create blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating blog post",
      error: error.message,
    });
  }
};

// GET ALL BLOG POSTS
export const getBlogPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      category,
      featured,
      search,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (featured !== undefined) query.isFeatured = featured === "true";

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const blogPosts = await BlogPost.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate("createdBy", "name email")
      .exec();

    const total = await BlogPost.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Blog posts retrieved successfully",
      data: blogPosts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get blog posts error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving blog posts",
      error: error.message,
    });
  }
};

// GET SINGLE BLOG POST BY ID OR SLUG
export const getBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const blogPost = isObjectId
      ? await BlogPost.findById(id).populate("createdBy", "name email")
      : await BlogPost.findOne({ slug: id }).populate("createdBy", "name email");

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog post retrieved successfully",
      data: blogPost,
    });
  } catch (error) {
    console.error("Get blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving blog post",
      error: error.message,
    });
  }
};

// UPDATE BLOG POST
export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    delete updateData.createdBy;

    if (updateData.slug && updateData.slug.trim()) {
      updateData.slug = await ensureUniqueSlug(
        generateSlug(updateData.slug),
        id,
      );
    } else if (updateData.title) {
      updateData.slug = await ensureUniqueSlug(
        generateSlug(updateData.title),
        id,
      );
    }

    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.path, "blog");
        if (uploadResult && uploadResult.url) {
          updateData.featuredImage = uploadResult.url;
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
      }
    }

    if (updateData.tags && typeof updateData.tags === "string") {
      updateData.tags = updateData.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured =
        updateData.isFeatured === "true" || updateData.isFeatured === true;
    }

    const existingPost = await BlogPost.findById(id);
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    if (
      updateData.status === "published" &&
      existingPost.status !== "published"
    ) {
      updateData.publishedAt = new Date();
    }

    const blogPost = await BlogPost.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: blogPost,
    });
  } catch (error) {
    console.error("Update blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating blog post",
      error: error.message,
    });
  }
};

// DELETE BLOG POST
export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const blogPost = await BlogPost.findByIdAndDelete(id);

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
      data: blogPost,
    });
  } catch (error) {
    console.error("Delete blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting blog post",
      error: error.message,
    });
  }
};

// TOGGLE BLOG POST STATUS (draft/published)
export const toggleBlogPostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'draft' or 'published'",
      });
    }

    const updateData = { status };
    if (status === "published") {
      const existing = await BlogPost.findById(id);
      if (existing && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const blogPost = await BlogPost.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Blog post ${status === "published" ? "published" : "moved to draft"} successfully`,
      data: blogPost,
    });
  } catch (error) {
    console.error("Toggle blog post status error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling blog post status",
      error: error.message,
    });
  }
};

// TOGGLE FEATURED
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const blogPost = await BlogPost.findByIdAndUpdate(
      id,
      { isFeatured },
      { new: true },
    );

    if (!blogPost) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Blog post ${isFeatured ? "marked as featured" : "removed from featured"} successfully`,
      data: blogPost,
    });
  } catch (error) {
    console.error("Toggle featured error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling featured status",
      error: error.message,
    });
  }
};
