// Define rules for file types and size limits
const fileRules = {
  "files[]": {
    maxSize: 10 * 1024 * 1024, // 10MB
    types: ["application/pdf"],
    sizeMessage: "Each file must not exceed 10MB in size.",
    typeMessage: "All files must be in PDF format.",
  },
  "documents[]": {
    maxSize: 1 * 1024 * 1024, // 1MB
    types: ["application/pdf"],
    sizeMessage: "Each document must not exceed 1MB in size.",
    typeMessage: "All documents must be in PDF format.",
  },
  qrCode: {
    maxSize: 1 * 1024 * 1024, // 1MB
    types: ["image/jpeg", "image/png"],
    sizeMessage: "The QR code image must not exceed 1MB in size.",
    typeMessage: "The QR code image must be in JPEG or PNG format.",
  },
  "images[]": {
    maxSize: 4 * 1024 * 1024, // 4MB
    types: ["image/jpeg", "image/png"],
    sizeMessage: "Each image must not exceed 4MB in size.",
    typeMessage: "All images must be in JPEG or PNG format.",
  },
  "sliderImages[]": {
    maxSize: 2 * 1024 * 1024, // 2MB
    types: ["image/jpeg", "image/png"],
    sizeMessage: "Each image must not exceed 2MB in size.",
    typeMessage: "All images must be in JPEG or PNG format.",
  },
  video: {
    maxSize: 20 * 1024 * 1024, // 20MB
    types: ["video/mp4"],
    sizeMessage: "The video file must not exceed 20MB in size.",
    typeMessage: "The video file must be in MP4 format.",
  },
  businessLiscense: {
    maxSize: 2 * 1024 * 1024, // 2MB
    types: ["application/pdf"],
    sizeMessage: "The business license document must not exceed 2MB in size.",
    typeMessage: "The business license document must be in PDF format.",
  },
  panCard: {
    maxSize: 2 * 1024 * 1024, // 2MB
    types: ["application/pdf"],
    sizeMessage: "The PAN card document must not exceed 2MB in size.",
    typeMessage: "The PAN card document must be in PDF format.",
  },
  file: {
    maxSize: 2 * 1024 * 1024, // 2MB
    types: ["application/pdf"],
    sizeMessage: "The file must not exceed 2MB in size.",
    typeMessage: "The file must be in PDF format.",
  },
  image: {
    maxSize: 2 * 1024 * 1024, // 2MB
    types: ["image/jpeg", "image/png"],
    sizeMessage: "Image must not exceed 2MB in size.",
    typeMessage: "Image must be in JPEG or PNG format.",
  },
  images: {
    maxSize: 4 * 1024 * 1024, // 4MB
    types: ["image/jpeg", "image/png"],
    sizeMessage: "Image must not exceed 4MB in size.",
    typeMessage: "Image must be in JPEG or PNG format.",
  },
};

// Middleware for file validation
const validateFiles = (req, res, next) => {
  try {
    // Check if any files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Iterate through uploaded files and validate
    for (const fieldName in req.files) {
      const files = req.files[fieldName]; // Array of files for each field
      const rules = fileRules[fieldName]; // Validation rules for the field

      if (!rules) continue; // Skip validation if no rules are defined for this field

      files.forEach((file) => {
        // Check file size
        if (file.size > rules.maxSize) {
          throw new Error(rules.sizeMessage);
        }

        // Check file type
        if (!rules.types.includes(file.mimetype)) {
          throw new Error(rules.typeMessage);
        }
      });
    }

    next(); // Validation passed
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

// Middleware for file validation during updates
const validateFilesForUpdate = (req, res, next) => {
  try {
    // Skip validation if no files are provided
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(); // Proceed without validation
    }

    // Iterate through uploaded files and validate
    for (const fieldName in req.files) {
      const files = req.files[fieldName]; // Array of files for each field
      const rules = fileRules[fieldName]; // Validation rules for the field

      if (!rules) continue; // Skip validation if no rules are defined for this field

      files.forEach((file) => {
        // Check file size
        if (file.size > rules.maxSize) {
          throw new Error(rules.sizeMessage);
        }

        // Check file type
        if (!rules.types.includes(file.mimetype)) {
          throw new Error(rules.typeMessage);
        }
      });
    }

    next(); // Validation passed
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { validateFiles, validateFilesForUpdate };
