import Subscriber from "../models/Subscriber.js";

// PUBLIC: SUBSCRIBE (newsletter signup)
export const subscribe = async (req, res) => {
  try {
    const { name, email, phone, interests, source } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.status === "unsubscribed") {
        existing.status = "active";
        existing.subscribedAt = new Date();
        if (name) existing.name = name;
        if (phone) existing.phone = phone;
        await existing.save();
        return res.status(200).json({
          success: true,
          message: "Welcome back! You've been re-subscribed.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "You're already subscribed!",
      });
    }

    let parsedInterests = [];
    if (interests) {
      parsedInterests =
        typeof interests === "string"
          ? interests.split(",").map((i) => i.trim()).filter(Boolean)
          : interests;
    }

    await Subscriber.create({
      name: name || "",
      email: email.toLowerCase(),
      phone: phone || "",
      source: source || "newsletter",
      interests: parsedInterests,
    });

    res.status(201).json({
      success: true,
      message: "Successfully subscribed!",
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({
      success: false,
      message: "Error subscribing",
      error: error.message,
    });
  }
};

// PUBLIC: UNSUBSCRIBE
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    subscriber.status = "unsubscribed";
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: "Successfully unsubscribed",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({
      success: false,
      message: "Error unsubscribing",
      error: error.message,
    });
  }
};

// ADMIN: GET ALL SUBSCRIBERS
export const getSubscribers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      source,
      search,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const subscribers = await Subscriber.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .exec();

    const total = await Subscriber.countDocuments(query);

    const statusCounts = await Subscriber.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats = {
      total: await Subscriber.countDocuments(),
      active: 0,
      inactive: 0,
      unsubscribed: 0,
    };
    statusCounts.forEach((s) => {
      if (s._id in stats) stats[s._id] = s.count;
    });

    res.status(200).json({
      success: true,
      data: subscribers,
      stats,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving subscribers",
      error: error.message,
    });
  }
};

// ADMIN: GET SINGLE SUBSCRIBER
export const getSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }
    res.status(200).json({ success: true, data: subscriber });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving subscriber",
      error: error.message,
    });
  }
};

// ADMIN: CREATE SUBSCRIBER (manual add)
export const createSubscriber = async (req, res) => {
  try {
    const { name, email, phone, interests, status, notes } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A subscriber with this email already exists",
      });
    }

    let parsedInterests = [];
    if (interests) {
      parsedInterests =
        typeof interests === "string"
          ? interests.split(",").map((i) => i.trim()).filter(Boolean)
          : interests;
    }

    const subscriber = await Subscriber.create({
      name: name || "",
      email: email.toLowerCase(),
      phone: phone || "",
      source: "manual",
      interests: parsedInterests,
      status: status || "active",
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Subscriber added successfully",
      data: subscriber,
    });
  } catch (error) {
    console.error("Create subscriber error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating subscriber",
      error: error.message,
    });
  }
};

// ADMIN: UPDATE SUBSCRIBER
export const updateSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.interests && typeof updateData.interests === "string") {
      updateData.interests = updateData.interests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
    }

    const subscriber = await Subscriber.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscriber updated successfully",
      data: subscriber,
    });
  } catch (error) {
    console.error("Update subscriber error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating subscriber",
      error: error.message,
    });
  }
};

// ADMIN: DELETE SUBSCRIBER
export const deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully",
    });
  } catch (error) {
    console.error("Delete subscriber error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting subscriber",
      error: error.message,
    });
  }
};

// ADMIN: TOGGLE STATUS
export const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "unsubscribed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const subscriber = await Subscriber.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Subscriber ${status} successfully`,
      data: subscriber,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating status",
      error: error.message,
    });
  }
};
