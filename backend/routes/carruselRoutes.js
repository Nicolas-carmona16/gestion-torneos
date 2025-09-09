import express from "express";
import {
  getCarouselImages,
  uploadCarouselImage,
  deleteCarouselImage
} from "../controllers/carruselController.js";
import { uploadSingleImage } from "../middlewares/uploadImage.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route to get carousel images (for Home page)
router.get("/", getCarouselImages);

// Admin-only routes for managing carousel images
router.post(
  "/upload",
  protect,
  authorizeRoles("admin"),
  uploadSingleImage,
  uploadCarouselImage
);

router.delete(
  "/:imageName",
  protect,
  authorizeRoles("admin"),
  deleteCarouselImage
);

export default router;
