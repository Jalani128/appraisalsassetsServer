import mongoose from "mongoose";
import Testimonial from "../models/Testimonial.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// CREATE TESTIMONIAL
export const createTestimonial = async (req, res) => {
  try {
    const {
      clientName,
      clientRole,
      clientCompany,
      testimonialText,
      rating,
      clientImage,
      propertyType,
      isFeatured,
      isActive,
    } = req.body;

    // Validate required fields
    if (!clientName || !testimonialText || !rating) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: client name, testimonial text, and rating",
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Handle image upload if file is provided
    let imageUrl = clientImage;
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.path,
          "testimonials",
        );
        if (uploadResult && uploadResult.url) {
          imageUrl = uploadResult.url;
        } else {
          console.warn(
            "Image upload failed or Cloudinary not configured, using original image URL or leaving empty",
          );
          imageUrl = clientImage || "";
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        imageUrl = clientImage || "";
      }
    }

    // Create new testimonial
    const testimonial = new Testimonial({
      clientName,
      clientRole,
      clientCompany,
      testimonialText,
      rating: Number(rating),
      clientImage: imageUrl,
      propertyType: propertyType || "sale",
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.admin?.id || req.user?.id,
    });

    await testimonial.save();

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: testimonial,
    });
  } catch (error) {
    console.error("Create testimonial error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating testimonial",
      error: error.message,
    });
  }
};

// GET ALL TESTIMONIALS
export const getTestimonials = async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        message: "Database not available, returning empty results",
        data: [],
        pagination: {
          currentPage: Number(req.query.page || 1),
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: Number(req.query.limit || 10),
        },
      });
    }

    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      featured,
      active,
      propertyType,
    } = req.query;

    // Build query
    const query = {};

    if (featured !== undefined) {
      query.isFeatured = featured === "true";
    }
    if (active !== undefined) {
      query.isActive = active === "true";
    }
    if (propertyType) {
      query.propertyType = propertyType;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const testimonials = await Testimonial.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate("createdBy", "name email")
      .lean()
      .exec();

    const total = await Testimonial.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Testimonials retrieved successfully",
      data: testimonials,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get testimonials error:", error.message);
    res.status(200).json({
      success: true,
      message: "Database error, returning empty results",
      data: [],
      pagination: {
        currentPage: Number(req.query.page || 1),
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: Number(req.query.limit || 10),
      },
    });
  }
};

// GET SINGLE TESTIMONIAL
export const getTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id).populate(
      "createdBy",
      "name email",
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial retrieved successfully",
      data: testimonial,
    });
  } catch (error) {
    console.error("Get testimonial error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving testimonial",
      error: error.message,
    });
  }
};

// UPDATE TESTIMONIAL
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.createdBy;

    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.path,
          "testimonials",
        );
        if (uploadResult && uploadResult.url) {
          updateData.clientImage = uploadResult.url;
        } else {
          console.warn(
            "Image upload failed or Cloudinary not configured, keeping original image",
          );
        }
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
      }
    }

    const testimonial = await Testimonial.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: testimonial,
    });
  } catch (error) {
    console.error("Update testimonial error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating testimonial",
      error: error.message,
    });
  }
};

// DELETE TESTIMONIAL
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
      data: testimonial,
    });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting testimonial",
      error: error.message,
    });
  }
};

// TOGGLE TESTIMONIAL STATUS
export const toggleTestimonialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Testimonial ${isActive ? "activated" : "deactivated"} successfully`,
      data: testimonial,
    });
  } catch (error) {
    console.error("Toggle testimonial status error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling testimonial status",
      error: error.message,
    });
  }
};

// TOGGLE FEATURED STATUS
export const toggleFeaturedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { isFeatured },
      { new: true },
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Testimonial ${
        isFeatured ? "marked as featured" : "removed from featured"
      } successfully`,
      data: testimonial,
    });
  } catch (error) {
    console.error("Toggle featured status error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling featured status",
      error: error.message,
    });
  }
};
