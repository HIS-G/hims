const logger = require("./logger");
const cloudinary = require("cloudinary").v2;
const { customers } = require("../models/Customers");
const { users } = require("../models/Users");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET_KEY,
});

const upload_file = async (req, res) => {
  const user_id = req.params.user_id;
  const customer_id = req.params.customer_id;
  const { fileContent, contentType } = req.body;

  if(!user_id && !customer_id) {
    return res.status(400).send({
      status: false,
      message: "kindly select an image."
    });
  }

  try {    
    cloudinary.uploader.upload(
      fileContent, 
      { folder: 'hism-profiles', resource_type: 'auto'}, 
      async (error, result) => {
        if(error) {
          //logger.error(error);
          console.log(error);
          return res.status(400).send({
            status: false,
            error: error,
            message: "Profile Image Upload Failed!"
          });
        }

        if(customer_id) {
          const customer = await customers.findByIdAndUpdate(
            fileName, 
              {
                photo_url: result.secure_url,
                photo_url_id: result.public_id
              },
              {
                upsert: true,
                new: true,
              }
          );
        }
        
        if(user_id) {
          const user = await users.findByIdAndUpdate(
            fileName, 
            {
              photo_url: result.secure_url, 
              photo_url_id: result.public_id
            }, 
            {
              upsert: true, 
              new: true
            }
          );
        }

        return res.send({
          status: true,
          message: "File uploaded successfully!"
        });
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "File upload failed" });
  }
};

module.exports = { upload_file };