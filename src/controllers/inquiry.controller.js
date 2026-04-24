import Inquiry from "../models/Inquiry.js";

// Create a new inquiry
export const createInquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      inquiry_type,
      property_title,
      property_reference,
      property_id,
      message,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone are required fields",
      });
    }

    const inquiry = new Inquiry({
      name,
      email,
      phone,
      inquiry_type,
      property_title,
      property_reference,
      property_id: property_id || null,
      message,
      status: "new",
      source: "Website",
    });

    await inquiry.save();

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit inquiry",
      error: error.message,
    });
  }
};

// Get all inquiries with pagination and filtering
export const getInquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = "created_date",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    // Only show active inquiries
    query.isActive = true;

    const inquiries = await Inquiry.find(query)
      .populate("property_id", "title reference")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Inquiry.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Inquiries retrieved successfully",
      data: inquiries,
      pagination: {
        current: page,
        pageSize: limit,
        total: total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries",
      error: error.message,
    });
  }
};

// Get single inquiry by ID
export const getInquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await Inquiry.findById(id).populate(
      "property_id",
      "title reference",
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry retrieved successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiry",
      error: error.message,
    });
  }
};

// Update inquiry status and notes
export const updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    // Update fields
    if (status !== undefined) {
      inquiry.status = status;
    }
    if (notes !== undefined) {
      inquiry.notes = notes;
    }

    await inquiry.save();

    res.status(200).json({
      success: true,
      message: "Inquiry updated successfully",
      data: inquiry,
    });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update inquiry",
      error: error.message,
    });
  }
};

// Delete inquiry
export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    await Inquiry.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Inquiry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete inquiry",
      error: error.message,
    });
  }
};
