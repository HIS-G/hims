// const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const AWS = require("aws-sdk");

/* const s3 = S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
}); */

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});

const s3 = new AWS.S3();

const upload_file = async (req, res) => {
  try {
    const { fileName, fileContent, contentType } = req.body; // Expecting Base64 data

    const buffer = Buffer.from(fileContent, "base64");

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `images/${fileName}`,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read"
    };

    console.log("Upload Params:", uploadParams);

    const response = await s3.upload(uploadParams);
    console.log("S3 Upload Response:", response);

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileName}`;
    console.log("File URL:", fileUrl);

    res.json({ message: "File uploaded successfully!" });
  } catch (error) {
    res.status(500).json({ error: "File upload failed" });
  }
};

module.exports = { upload_file };