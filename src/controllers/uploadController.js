const cloudinary = require("cloudinary").v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET_KEY,
});

const uploadToDM = async (req, res) => {
  const { fileContent, contentType } = req.body;

  if (!fileContent || !contentType) {
    return res.status(400).json({ message: "Missing file or contentType" });
  }

  try {
    const result = await cloudinary.uploader.upload(fileContent, {
      folder: "hism-DMs",
      resource_type: "auto",
    });

    return res.status(200).json({
      status: true,
      message: "Uploaded Successfully",
      result: result.secure_url,
    });
  } catch (error) {
    console.error("Cloudinary Error", error);
    return res.status(500).json({
      status: false,
      message: "Upload Failed",
      error: error.message,
    });
  }
};

const uploadToChannel = async (req, res) => {
  const { fileContent, contentType } = req.body;

  if (!fileContent || !contentType) {
    return res.status(400).json({ message: "Missing file or contentType" });
  }

  try {
    const result = await cloudinary.uploader.upload(fileContent, {
      folder: "hism-channels",
      resource_type: "auto",
    });

    return res.status(200).json({
      status: true,
      message: "Uploaded Successfully",
      result: result.secure_url,
    });
  } catch (error) {
    console.error("Cloudinary Error", error);
    return res.status(500).json({
      status: false,
      message: "Upload Failed",
      error: error.message,
    });
  }
};
module.exports = {
  uploadToDM,
  uploadToChannel,
};
