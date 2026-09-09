import {
  createListingService,
  getListingsService,
  getListingByIdService,
  updateListingService,
  publishListingService,
  cancelListingService,
} from "./listing.service.js";

export const createListing = async (req, res) => {
  try {
    const {
      scrapRecordId,
      sellingMode,
      quantityKg,
      expectedPricePerKg,
      closesAt,
    } = req.body;

    const listing = await createListingService({
      scrapRecordId,
      sellingMode,
      quantityKg,
      expectedPricePerKg,
      closesAt,

      // Replace this later with authenticated user
      createdByUserId: req.user?.id,
    });

    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: listing,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


export const getListings = async (req, res) => {
  try {
    const {
      status,
      sellingMode,
      categoryId,
      mine,
      page,
      limit,
    } = req.query;

    if (mine === "true" && !req.user?.organisationId) {
      return res.status(403).json({
        success: false,
        message: "User must belong to an organisation",
      });
    }

    const result = await getListingsService({
      status,
      sellingMode,
      categoryId,
      ownerId: mine === "true" ? req.user.organisationId : undefined,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result.listings,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await getListingByIdService(id);

    return res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await updateListingService(
      id,
      req.body,
      req.user?.organisationId
    );

    return res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      data: listing,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const publishListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing =
      await publishListingService(id, req.user?.organisationId);

    return res.status(200).json({
      success: true,
      message: "Listing published successfully",
      data: listing,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing =
      await cancelListingService(id, req.user?.organisationId);

    return res.status(200).json({
      success: true,
      message: "Listing cancelled successfully",
      data: listing,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};