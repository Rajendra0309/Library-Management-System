const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");

const {
  uploadCover,
} = require("../controllers/upload.controller");

router.post(
  "/upload-cover",
  upload.single("cover"),
  uploadCover
);

module.exports = router;