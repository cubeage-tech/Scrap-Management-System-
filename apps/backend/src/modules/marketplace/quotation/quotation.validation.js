import Joi from "joi";
import { uuid, positiveNumber, optionalString, validate } from "../../../core/utils/validation.js";

const paymentTerms = Joi.string().valid("ADVANCE", "ON_PICKUP", "DAYS_15", "DAYS_30", "DAYS_45").optional();

const quotationStatus = Joi.string().valid(
  "SUBMITTED",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "WITHDRAWN"
);

const createQuotationSchema = Joi.object({
  listingId: uuid.required(),
  pricePerKg: positiveNumber,
  quantityKg: positiveNumber,
  paymentTerms,
  note: optionalString,
  isSealed: Joi.boolean().optional(),
  validUntil: Joi.date().allow(null).optional()
});

const getQuotationsQuerySchema = Joi.object({
  listingId: uuid.optional(),
  status: quotationStatus.optional()
});

const handleValidation = (req, res, next, validationResult, target = "body") => {
  if (!validationResult.isValid) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationResult.errors,
    });
  }
  req[target] = validationResult.value;
  next();
};

export const validateCreateQuotation = (req, res, next) => {
  const result = validate(createQuotationSchema, req.body);
  return handleValidation(req, res, next, result, "body");
};

export const validateGetQuotations = (req, res, next) => {
  const result = validate(getQuotationsQuerySchema, req.query);
  return handleValidation(req, res, next, result, "validatedQuery");
};
