import dotenv from "dotenv";
import mongoose from "mongoose";
import Testimonial from "../models/Testimonial.js";
import Admin from "../models/Admin.js";

dotenv.config();

export const seedTestimonials = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Find an admin user to use as createdBy reference
    const admin = await Admin.findOne({ isActive: true });
    if (!admin) {
      console.error("No active admin found. Please run setup-admin first.");
      process.exit(1);
    }

    console.log(`Using admin: ${admin.name} (${admin.email})`);

    // Clear existing testimonials
    await Testimonial.deleteMany({});
    console.log("Cleared existing testimonials");

    // Demo testimonials data
    const demoTestimonials = [
      {
        clientName: "Sarah Johnson",
        clientRole: "Homeowner",
        clientCompany: "",
        testimonialText: "The team at AWR Properties helped me sell my house quickly and for a great price. Their professionalism and local market knowledge made the entire process smooth and stress-free. Highly recommend!",
        rating: 5,
        clientImage: "",
        propertyType: "sale",
        isFeatured: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        clientName: "Michael Torres",
        clientRole: "Real Estate Investor",
        clientCompany: "",
        testimonialText: "I have worked with several property appraisal companies, but AWR Properties stands out for their accurate valuations and timely reports. Their investment property analysis helped me make informed decisions.",
        rating: 5,
        clientImage: "",
        propertyType: "investment",
        isFeatured: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        clientName: "Emily Chen",
        clientRole: "First-time Buyer",
        clientCompany: "",
        testimonialText: "As a first-time homebuyer, I was nervous about the process. The AWR team guided me through every step, from property search to closing. Their patience and expertise were invaluable.",
        rating: 4,
        clientImage: "",
        propertyType: "sale",
        isFeatured: false,
        isActive: true,
        createdBy: admin._id,
      },
      {
        clientName: "Robert Kim",
        clientRole: "Landlord",
        clientCompany: "",
        testimonialText: "Needed a rental valuation for my property portfolio and AWR delivered comprehensive reports that helped me set competitive rental rates. Their attention to detail is impressive.",
        rating: 5,
        clientImage: "",
        propertyType: "rent",
        isFeatured: true,
        isActive: true,
        createdBy: admin._id,
      },
      {
        clientName: "Lisa Williams",
        clientRole: "Home Seller",
        clientCompany: "",
        testimonialText: "Sold my property above asking price thanks to AWR's market analysis and pricing strategy. Their marketing materials made my listing stand out online.",
        rating: 5,
        clientImage: "",
        propertyType: "sale",
        isFeatured: false,
        isActive: true,
        createdBy: admin._id,
      },
    ];

    // Insert testimonials
    const createdTestimonials = await Testimonial.insertMany(demoTestimonials);
    console.log(`Successfully created ${createdTestimonials.length} testimonials:`);
    createdTestimonials.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.clientName} - ${t.rating}/5`);
    });

  } catch (error) {
    console.error("Error seeding testimonials:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestimonials();
}
