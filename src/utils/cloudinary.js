import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );

export const getCloudinaryConfigErrorMessage = () =>
  "Cloudinary is not configured on the server. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your Vercel project (Settings → Environment Variables), then redeploy.";

export const getCloudinaryAssetUrl = (result) =>
  result?.secure_url || result?.url || "";

/** Safe public_id for raw PDF uploads (extension required for correct delivery). */
export function buildPdfPublicId(originalname) {
  let name = String(originalname || "property-brochure.pdf")
    .replace(/^.*[\\/]/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  if (!name.toLowerCase().endsWith(".pdf")) {
    name = `${name}.pdf`;
  }
  return `${Date.now()}_${name}`;
}

/** Strip broken fl_attachment segments; delivery filename is set by our API. */
export function getCloudinaryPdfDeliveryUrl(url) {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) {
    return url;
  }
  return url.replace(/\/fl_attachment:[^/]+\//, "/");
}

function buildUploadParams(folder, options = {}) {
  const resourceType = options.resourceType || "auto";
  const params = {
    resource_type: resourceType,
    folder,
    use_filename: Boolean(options.useFilename ?? true),
    unique_filename: Boolean(options.uniqueFilename ?? true),
  };

  if (options.publicId) {
    let id = String(options.publicId).replace(/^.*\//, "");
    if (resourceType === "raw") {
      if (!id.toLowerCase().endsWith(".pdf")) {
        id = `${id}.pdf`;
      }
      params.public_id = id;
    } else {
      params.public_id = id.replace(/\.pdf$/i, "");
      if (options.format) {
        params.format = options.format;
      }
    }
    params.use_filename = false;
    params.unique_filename = false;
  } else if (options.format && resourceType !== "raw") {
    params.format = options.format;
  }

  return params;
}

export function uploadBufferToCloudinary(
  buffer,
  folder = "properties",
  options = {},
) {
  if (!buffer?.length) {
    return Promise.resolve(null);
  }

  if (!isCloudinaryConfigured()) {
    console.warn(getCloudinaryConfigErrorMessage());
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const uploadParams = buildUploadParams(folder, options);
    const stream = cloudinary.uploader.upload_stream(
      uploadParams,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    Readable.from(buffer).pipe(stream);
  });
}

/** Upload from disk path (local dev / legacy). */
export const uploadToCloudinary = async (
  localFilePath,
  folder = "properties",
  options = {},
) => {
  if (Buffer.isBuffer(localFilePath)) {
    return uploadBufferToCloudinary(localFilePath, folder, options);
  }

  try {
    if (!isCloudinaryConfigured()) {
      console.warn(getCloudinaryConfigErrorMessage());
      return null;
    }

    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(
      localFilePath,
      buildUploadParams(folder, options),
    );

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (typeof localFilePath === "string" && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};

/** Prefer multer memory buffer (Vercel/serverless); fall back to disk path. */
export async function uploadMulterFile(file, folder = "properties", options = {}) {
  if (!file) return null;

  if (!isCloudinaryConfigured()) {
    return null;
  }

  const uploadOptions = { ...options };
  if (uploadOptions.resourceType === "raw" && file.originalname) {
    uploadOptions.publicId =
      uploadOptions.publicId || buildPdfPublicId(file.originalname);
    uploadOptions.useFilename = false;
    uploadOptions.uniqueFilename = false;
  }

  if (file.buffer?.length) {
    return uploadBufferToCloudinary(file.buffer, folder, uploadOptions);
  }

  if (file.path) {
    return uploadToCloudinary(file.path, folder, uploadOptions);
  }

  return null;
}

export const uploadOnCloudinary = uploadToCloudinary;
