const s3 = require("../config/s3");

exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileName = `covers/${Date.now()}-${req.file.originalname}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const result = await s3.upload(params).promise();

    return res.status(200).json({
      success: true,
      imageUrl: result.Location,
    });
  } catch (error) {
    console.error("Upload Cover Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};