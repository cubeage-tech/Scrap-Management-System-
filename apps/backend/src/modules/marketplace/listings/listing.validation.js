import {
  validateCreateListing as validateCreateListingData,
  validateUpdateListing as validateUpdateListingData,
} from "../../../core/utils/validation.js";

const handleValidation = (req, res, next, validationResult) => {
  if (!validationResult.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationResult.errors,
    });
  }

  req.body = validationResult.value;

  next();
};

export const validateCreateListing = (req, res, next) => {
  const result = validateCreateListingData(req.body);

  return handleValidation(req, res, next, result);
};

export const validateUpdateListing = (req, res, next) => {
  const result = validateUpdateListingData(req.body);

  return handleValidation(req, res, next, result);
};