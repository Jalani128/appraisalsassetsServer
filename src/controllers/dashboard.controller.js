import Property from "../models/Property.js";
import Inquiry from "../models/Inquiry.js";

function pctGrowth(current, previous) {
  if (previous == null || previous === 0) {
    if (current > 0) return "new";
    return null;
  }
  const pct = ((current - previous) / previous) * 100;
  if (!Number.isFinite(pct)) return null;
  return pct >= 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`;
}

// GET DASHBOARD STATISTICS
export const getDashboardStats = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments({ isActive: true });
    const activeListings = await Property.countDocuments({
      isActive: true,
      status: "available",
    });

    const totalInquiries = await Inquiry.countDocuments({ isActive: true });

    // Month boundaries for growth (optional, real comparison)
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const propertiesThisMonth = await Property.countDocuments({
      isActive: true,
      createdAt: { $gte: startOfThisMonth },
    });
    const propertiesLastMonth = await Property.countDocuments({
      isActive: true,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });

    const listingsThisMonth = await Property.countDocuments({
      isActive: true,
      status: "available",
      createdAt: { $gte: startOfThisMonth },
    });
    const listingsLastMonth = await Property.countDocuments({
      isActive: true,
      status: "available",
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });

    const inquiriesThisMonth = await Inquiry.countDocuments({
      isActive: true,
      createdAt: { $gte: startOfThisMonth },
    });
    const inquiriesLastMonth = await Inquiry.countDocuments({
      isActive: true,
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
    });

    const growthProperties = pctGrowth(propertiesThisMonth, propertiesLastMonth);
    const growthListings = pctGrowth(listingsThisMonth, listingsLastMonth);
    const growthInquiries = pctGrowth(inquiriesThisMonth, inquiriesLastMonth);

    return res.status(200).json({
      success: true,
      stats: {
        totalProperties,
        activeListings,
        totalInquiries,
        growth: {
          properties: growthProperties,
          listings: growthListings,
          inquiries: growthInquiries,
        },
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET RECENT PROPERTIES
export const getRecentProperties = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const properties = await Property.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate("createdBy", "name email")
      .select(
        "title price location images propertyType status bedrooms bathrooms sizeSqft createdAt",
      );

    return res.status(200).json({
      success: true,
      message: "Recent properties fetched successfully",
      properties,
    });
  } catch (error) {
    console.error("Get recent properties error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET RECENT INQUIRIES (real data from Inquiry model)
export const getRecentInquiries = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const docs = await Inquiry.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    const inquiries = docs.map((doc) => ({
      _id: doc._id,
      name: doc.name,
      email: doc.email,
      property:
        doc.property_title ||
        doc.property_reference ||
        (doc.message
          ? String(doc.message).slice(0, 80) +
            (doc.message.length > 80 ? "…" : "")
          : ""),
      status: doc.status,
      createdAt: doc.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Recent inquiries fetched successfully",
      inquiries,
    });
  } catch (error) {
    console.error("Get recent inquiries error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
