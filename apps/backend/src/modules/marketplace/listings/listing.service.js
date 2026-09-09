import prisma from "../../../core/lib/prisma.js";

const VALID_SELLING_MODES = [
  "QUOTATION",
  "AUCTION",
  "TENDER",
];

const notFoundError = () => {
  const error = new Error("Listing not found");
  error.statusCode = 404;
  return error;
};

const forbiddenError = () => {
  const error = new Error("You do not own the scrap behind this listing");
  error.statusCode = 403;
  return error;
};

// ─── Create Listing ──────────────────────────────────────────────────────────

export const createListingService = async ({
  scrapRecordId,
  sellingMode,
  quantityKg,
  expectedPricePerKg,
  closesAt,
  createdByUserId,
}) => {
  // 1. Check scrap record
  const scrap = await prisma.scrapRecord.findUnique({
    where: {
      id: scrapRecordId,
    },
  });

  if (!scrap) {
    throw new Error("Scrap record not found");
  }

  // 2. Check user
  const user = await prisma.user.findUnique({
    where: {
      id: createdByUserId,
    },
    select: {
      organisationId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 3. Check scrap ownership
  if (scrap.ownerId !== user.organisationId) {
    throw new Error(
      "You cannot create a listing for scrap owned by another organisation"
    );
  }

  // 4. Check selling mode
  if (!VALID_SELLING_MODES.includes(sellingMode)) {
    throw new Error("Invalid selling mode");
  }

  // 5. Check quantity
  const quantity = Number(quantityKg);

  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  // 6. Check available inventory
  const availableQuantity = Number(scrap.availableQuantityKg);

  if (quantity > availableQuantity) {
    throw new Error(
      `Listing quantity cannot exceed available quantity (${availableQuantity} kg)`
    );
  }

  // 7. Create listing + update inventory
  const listing = await prisma.$transaction(async (tx) => {
    const newListing = await tx.listing.create({
      data: {
        scrapRecordId,
        sellingMode,
        quantityKg,
        expectedPricePerKg:
          expectedPricePerKg !== undefined &&
          expectedPricePerKg !== null
            ? expectedPricePerKg
            : null,
        closesAt: closesAt ? new Date(closesAt) : null,
        status: "DRAFT",
        createdByUserId: createdByUserId || null,
      },
      include: {
        scrapRecord: {
          include: {
            category: true,
          },
        },
      },
    });

    // Update allocated/listed quantity
    await tx.scrapRecord.update({
      where: {
        id: scrapRecordId,
      },
      data: {
        listedQuantityKg: {
          increment: quantity,
        },
        availableQuantityKg: {
          decrement: quantity,
        },
      },
    });

    return newListing;
  });

  return listing;
};

// ─── Get Listing ──────────────────────────────────────────────────────────


export const getListingsService = async ({
  status,
  sellingMode,
  categoryId,
  ownerId,
  page = 1,
  limit = 10,
}) => {
  const skip = (Number(page) - 1) * Number(limit);

  const where = {};

  if (status) {
    where.status = status;
  }

  if (sellingMode) {
    where.sellingMode = sellingMode;
  }

  const scrapRecordWhere = {};

  if (categoryId) {
    scrapRecordWhere.categoryId = categoryId;
  }

  if (ownerId) {
    scrapRecordWhere.ownerId = ownerId;
  }

  if (Object.keys(scrapRecordWhere).length > 0) {
    where.scrapRecord = scrapRecordWhere;
  }

  const [listings, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        scrapRecord: {
          include: {
            category: true,
            images: true,
          },
        },
      },
    }),

    prisma.listing.count({
      where,
    }),
  ]);

  return {
    listings,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

// ─── Get Listing By ID ──────────────────────────────────────────────────────────


export const getListingByIdService = async (listingId) => {
  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      scrapRecord: {
        include: {
          category: true,
          images: true,
        },
      },
    },
  });

  if (!listing) {
    throw new Error("Listing not found");
  }

  return listing;
};

// ─── Update Listing ──────────────────────────────────────────────────────────

export const updateListingService = async (
  listingId,
  updateData,
  organisationId
) => {
  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      scrapRecord: true,
    },
  });

  if (!listing) {
    throw notFoundError();
  }

  if (listing.scrapRecord.ownerId !== organisationId) {
    throw forbiddenError();
  }

  if (listing.status !== "DRAFT") {
    throw new Error(
      "Only draft listings can be updated"
    );
  }

  const data = {};

  if (updateData.sellingMode !== undefined) {
    data.sellingMode = updateData.sellingMode;
  }

  if (updateData.expectedPricePerKg !== undefined) {
    data.expectedPricePerKg =
      updateData.expectedPricePerKg;
  }

  if (updateData.closesAt !== undefined) {
    data.closesAt = updateData.closesAt
      ? new Date(updateData.closesAt)
      : null;
  }

  if (updateData.quantityKg !== undefined) {
    const newQuantity = Number(updateData.quantityKg);
    const oldQuantity = Number(listing.quantityKg);

    const quantityDifference =
      newQuantity - oldQuantity;

    const scrap = await prisma.scrapRecord.findUnique({
      where: {
        id: listing.scrapRecordId,
      },
    });

    if (!scrap) {
      throw new Error("Scrap record not found");
    }

    if (
      quantityDifference > 0 &&
      Number(scrap.availableQuantityKg) <
        quantityDifference
    ) {
      throw new Error(
        "Insufficient available scrap quantity"
      );
    }

    data.quantityKg = newQuantity;

    return prisma.$transaction(async (tx) => {
      const updatedListing =
        await tx.listing.update({
          where: {
            id: listingId,
          },
          data,
        });

      await tx.scrapRecord.update({
        where: {
          id: listing.scrapRecordId,
        },
        data: {
          listedQuantityKg:
            quantityDifference > 0
              ? {
                  increment: quantityDifference,
                }
              : {
                  decrement: Math.abs(
                    quantityDifference
                  ),
                },

          availableQuantityKg:
            quantityDifference > 0
              ? {
                  decrement: quantityDifference,
                }
              : {
                  increment: Math.abs(
                    quantityDifference
                  ),
                },
        },
      });

      return updatedListing;
    });
  }

  return prisma.listing.update({
    where: {
      id: listingId,
    },
    data,
  });
};

// ─── Publish Listing ──────────────────────────────────────────────────────────

export const publishListingService = async (listingId, organisationId) => {
  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      scrapRecord: true,
    },
  });

  if (!listing) {
    throw notFoundError();
  }

  if (listing.scrapRecord.ownerId !== organisationId) {
    throw forbiddenError();
  }

  if (listing.status !== "DRAFT") {
    throw new Error(
      "Only draft listings can be published"
    );
  }

  const updatedListing =
    await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

  return updatedListing;
};


// ─── Cancel Listing ──────────────────────────────────────────────────────────


export const cancelListingService = async (listingId, organisationId) => {
  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      scrapRecord: true,
    },
  });

  if (!listing) {
    throw notFoundError();
  }

  if (listing.scrapRecord.ownerId !== organisationId) {
    throw forbiddenError();
  }

  if (
    listing.status !== "DRAFT" &&
    listing.status !== "PUBLISHED"
  ) {
    throw new Error(
      "This listing cannot be cancelled"
    );
  }

  return prisma.$transaction(async (tx) => {
    const updatedListing =
      await tx.listing.update({
        where: {
          id: listingId,
        },
        data: {
          status: "CANCELLED",
          closedAt: new Date(),
        },
      });

    await tx.scrapRecord.update({
      where: {
        id: listing.scrapRecordId,
      },
      data: {
        listedQuantityKg: {
          decrement: listing.quantityKg,
        },
        availableQuantityKg: {
          increment: listing.quantityKg,
        },
      },
    });

    return updatedListing;
  });
};