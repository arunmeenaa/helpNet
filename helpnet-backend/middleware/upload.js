const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${extension}`;

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const mimeType = file.mimetype.toLowerCase();

  const fileExtension = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

  if (
    mimeType.startsWith("image/") ||
    allowedExtensions.includes(fileExtension)
  ) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Invalid format! Only image files (JPG, PNG, WEBP, GIF) are allowed.",
    ),
    false,
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = upload;
