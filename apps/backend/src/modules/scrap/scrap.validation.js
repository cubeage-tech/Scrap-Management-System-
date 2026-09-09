import {
  validateCreateScrap as validateCreateScrapData,
  validateUpdateScrap as validateUpdateScrapData,
} from "../../core/utils/validation.js";

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

export const validateCreateScrap = (req, res, next) => {
  const result = validateCreateScrapData(req.body);

  return handleValidation(req, res, next, result);
};

export const validateUpdateScrap = (req, res, next) => {
  const result = validateUpdateScrapData(req.body);

  return handleValidation(req, res, next, result);
};
