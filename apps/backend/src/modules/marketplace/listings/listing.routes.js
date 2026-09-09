import express from "express";

import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  publishListing,
  cancelListing,
} from "./listing.controller.js";

import {
  validateCreateListing,
  validateUpdateListing,
} from "./listing.validation.js";

import requireAuth from "../../../core/middlewares/auth.middleware.js";
import { allowRoles } from "../../../core/middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  allowRoles("INDUSTRY", "DEALER"),
  validateCreateListing,
  createListing
);

router.get("/", requireAuth, getListings);

router.get("/:id", requireAuth, getListingById);

router.patch(
  "/:id",
  requireAuth,
  allowRoles("INDUSTRY", "DEALER"),
  validateUpdateListing,
  updateListing
);

router.patch(
  "/:id/publish",
  requireAuth,
  allowRoles("INDUSTRY", "DEALER"),
  publishListing
);

router.delete(
  "/:id",
  requireAuth,
  allowRoles("INDUSTRY", "DEALER"),
  cancelListing
);

export default router;