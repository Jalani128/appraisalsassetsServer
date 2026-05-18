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
/** Cloudinary blocks delivery (401) when public_id ends with ".pdf" — never include it. */
export function buildPdfPublicId(originalname) {
  let name = String(originalname || "property-brochure.pdf")
    .replace(/^.*[\\/]/, "")
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  if (!name) name = "property-brochure";
  return `${Date.now()}_${name}`;
}

export async function verifyCloudinaryRawDelivery(url) {
  const deliveryUrl = getCloudinaryPdfDeliveryUrl(url);
  if (!deliveryUrl) return false;
  const response = await fetch(deliveryUrl, { method: "HEAD" });
  if (response.status === 405) {
    const getResponse = await fetch(deliveryUrl);
    return getResponse.ok;
  }
  return response.ok;
}

/** Strip broken fl_attachment segments; delivery filename is set by our API. */
export function getCloudinaryPdfDeliveryUrl(url) {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) {
    return url;
  }
  return url.replace(/\/fl_attachment:[^/]+\//, "/");
}

/** Extract folder + public_id from a Cloudinary raw delivery URL. */
export function parseCloudinaryRawAsset(url) {
  if (!url?.includes("res.cloudinary.com")) return null;
  const path = url.split("?")[0];
  const match = path.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/i);
  if (!match) return null;
  return { publicId: decodeURIComponent(match[1]) };
}

export function getSignedCloudinaryRawUrl(publicId, type = "upload") {
  if (!publicId || !isCloudinaryConfigured()) return "";
  return cloudinary.url(publicId, {
    resource_type: "raw",
    type,
    sign_url: true,
    secure: true,
  });
}

/** Fetch raw PDF bytes; retries with signed URLs when Cloudinary returns 401/403. */
export async function fetchCloudinaryRawBuffer(url, publicIdOverride = "") {
  const deliveryUrl = getCloudinaryPdfDeliveryUrl(url);
  if (!deliveryUrl) {
    throw new Error("Missing Cloudinary URL");
  }

  const tryFetch = async (fetchUrl) => {
    const response = await fetch(fetchUrl, {
      headers: { Accept: "application/pdf,application/octet-stream,*/*" },
    });
    if (!response.ok) {
      return { ok: false, status: response.status, response };
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return { ok: true, buffer, status: response.status };
  };

  let result = await tryFetch(deliveryUrl);
  if (result.ok) return result.buffer;

  if (result.status !== 401 && result.status !== 403) {
    throw new Error(`Cloudinary fetch failed (${result.status})`);
  }

  const asset = parseCloudinaryRawAsset(deliveryUrl);
  const publicId = publicIdOverride || asset?.publicId;
  if (!publicId) {
    throw new Error("Could not parse Cloudinary asset for signed download");
  }

  for (const type of ["upload", "authenticated", "private"]) {
    const signedUrl = getSignedCloudinaryRawUrl(publicId, type);
    if (!signedUrl) continue;
    result = await tryFetch(signedUrl);
    if (result.ok) return result.buffer;
  }

  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  try {
    const privateUrl = cloudinary.utils.private_download_url(
      publicId.replace(/\.pdf$/i, ""),
      "pdf",
      { resource_type: "raw", expires_at: expiresAt },
    );
    if (privateUrl) {
      result = await tryFetch(privateUrl);
      if (result.ok) return result.buffer;
    }
  } catch (error) {
    console.error("Cloudinary private_download_url failed:", error.message);
  }

  throw new Error(`Cloudinary fetch failed (${result.status})`);
}

function buildUploadParams(folder, options = {}) {
  const resourceType = options.resourceType || "auto";
  const params = {
    resource_type: resourceType,
    folder,
    type: "upload",
    access_mode: "public",
    use_filename: Boolean(options.useFilename ?? true),
    unique_filename: Boolean(options.uniqueFilename ?? true),
  };

  if (options.publicId) {
    let id = String(options.publicId).replace(/^.*\//, "");
    if (resourceType === "raw") {
      id = id.replace(/\.pdf$/i, "");
      if (!id) id = `brochure_${Date.now()}`;
      params.public_id = id;
      params.display_name = id;
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
