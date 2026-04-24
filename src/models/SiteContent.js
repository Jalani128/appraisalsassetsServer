import mongoose from "mongoose";

const siteContentSchema = new mongoose.Schema(
  {
    hero: {
      badgeText: {
        type: String,
        default: "RERA Certified | Trusted Since 2010",
      },
      headline: {
        type: String,
        default: "Best Real Estate Agency in Dubai",
      },
      description: {
        type: String,
        default:
          "Trusted Real Estate Company & Property Experts. Assets & Appraisal is a leading real estate agency in Dubai and trusted real estate company, recognized among the top real estate companies in Dubai for delivering complete real estate services in Dubai across residential and commercial sectors.",
      },
    },

    about: {
      headline: {
        type: String,
        default: "About A&A Real Estate",
      },
      description: {
        type: String,
        default:
          "Dubai's premier real estate advisory firm specializing in luxury properties, asset valuation, and investment guidance.",
      },
      mission: {
        type: String,
        default:
          "To provide unparalleled real estate services that exceed expectations, backed by deep market expertise and unwavering commitment to our clients.",
      },
      vision: {
        type: String,
        default:
          "To be the most trusted name in Dubai real estate, known for integrity, excellence, and results.",
      },
    },

    contact: {
      officeAddress: {
        type: String,
        default: "Office 1201, Burj Khalifa Boulevard, Downtown Dubai, UAE",
      },
      phone: {
        type: String,
        default: "+971 4555 1234",
      },
      email: {
        type: String,
        default: "assetsapprecial@gmail.com",
      },
      whatsapp: {
        type: String,
        default: "+971 50 123 4567",
      },
      officeHours: {
        type: String,
        default: "Sun - Thu: 9:00 AM - 6:00 PM\nFri: 9:00 AM - 1:00 PM\nSat: By Appointment",
      },
      socialLinks: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        twitter: { type: String, default: "" },
        youtube: { type: String, default: "" },
      },
      mapEmbedUrl: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  },
);

siteContentSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

siteContentSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const SiteContent = mongoose.model("SiteContent", siteContentSchema);
export default SiteContent;
