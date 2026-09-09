import Joi from "joi";
import { uuid, positiveNumber, validate } from "../../../core/utils/validation.js";

const createAuctionSchema = Joi.object({
  listingId: uuid.required(),
  startsAt: Joi.date().iso().required(),
  endsAt: Joi.date().iso().min(Joi.ref('startsAt')).required(),
  startingPricePerKg: positiveNumber.required(),
  reservePricePerKg: positiveNumber.optional(),
  minIncrement: positiveNumber.required(),
  extensionWindowMin: Joi.number().min(0).optional(),
  extensionMinutes: Joi.number().min(0).optional()
});

const placeBidSchema = Joi.object({
  pricePerKg: positiveNumber.required()
});

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

export const validateCreateAuction = (req, res, next) => {
  const result = validate(createAuctionSchema, req.body);
  return handleValidation(req, res, next, result);
};

export const validatePlaceBid = (req, res, next) => {
  const result = validate(placeBidSchema, req.body);
  return handleValidation(req, res, next, result);
};
