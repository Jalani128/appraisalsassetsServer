import mongoose from "mongoose";

const appSettingsSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      required: true,
      unique: true,
      default: "default",
    },
    general: {
      applicationName: { type: String, default: "A&A Real Estate" },
      supportEmail: { type: String, default: "" },
      supportPhone: { type: String, default: "" },
      whatsappNumber: { type: String, default: "" },
      timezone: { type: String, default: "Asia/Dubai" },
      maintenanceMode: { type: Boolean, default: false },
    },
    security: {
      sessionTimeoutMinutes: { type: Number, default: 15, min: 5, max: 1440 },
      allowNewAdminCreation: { type: Boolean, default: true },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true },
);

appSettingsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

appSettingsSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const AppSettings = mongoose.model("AppSettings", appSettingsSchema);
export default AppSettings;
