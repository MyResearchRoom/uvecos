const express = require("express");
const router = express.Router();
const {
  createMainCategory,
  getAllMainCategories,
  getAllMainCategoriesNames,
  getMainCategoryById,
  updateMainCategory,
  deleteMainCategory,
  connectCategories,
  rejectCategories,
  getAllMainCategoriesImages,
} = require("../controllers/mainCategoryController");
const authenticate = require("../middlewares/authMiddleware");
const { upload } = require("../middlewares/upload");

// Create a new Main Category
router.post(
  "/",
  upload.single("image"),
  authenticate(["platformUser"]),
  createMainCategory
);

// Get all Main Categories
router.get("/", getAllMainCategories);

router.get("/list/names", getAllMainCategoriesNames);

router.get("/list/images", getAllMainCategoriesImages);

// Get a single Main Category by ID
router.get("/:id", getMainCategoryById);

// Update a Main Category by ID
router.put(
  "/:id",
  upload.single("image"),
  authenticate(["platformUser"]),
  updateMainCategory
);

// Delete a Main Category by ID
router.delete("/:id", authenticate(["platformUser"]), deleteMainCategory);

router.post(
  "/connect-categories",
  authenticate(["platformUser"]),
  connectCategories
);

router.post(
  "/reject-categories",
  authenticate(["platformUser"]),
  rejectCategories
);

module.exports = router;
