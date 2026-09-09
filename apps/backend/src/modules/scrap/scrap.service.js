import prisma from '../../core/lib/prisma.js';

const notFoundError = () => {
  const error = new Error('Scrap record not found or unauthorized');
  error.statusCode = 404;
  return error;
};

const pickScrapFields = (data) => {
  const fields = {};

  if (data.categoryId !== undefined) fields.categoryId = data.categoryId;
  if (data.description !== undefined) fields.description = data.description;
  if (data.condition !== undefined) fields.condition = data.condition;
  if (data.locationLabel !== undefined) fields.locationLabel = data.locationLabel;
  if (data.totalQuantityKg !== undefined) fields.totalQuantityKg = data.totalQuantityKg;

  return fields;
};

export const createScrap = async (data, userId, organisationId) => {
  const fields = pickScrapFields(data);

  return await prisma.scrapRecord.create({
    data: {
      ...fields,
      ownerId: organisationId,
      createdByUserId: userId,
      availableQuantityKg: fields.totalQuantityKg,
      status: 'AVAILABLE'
    }
  });
};

export const getScraps = async (organisationId, options = {}) => {
  const { page, limit } = options;
  const query = {
    where: { ownerId: organisationId },
    include: { category: true, images: true },
    orderBy: { createdAt: 'desc' },
  };

  if (page && limit) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    query.skip = (pageNum - 1) * limitNum;
    query.take = limitNum;
  }

  return await prisma.scrapRecord.findMany(query);
};


export const getScrapById = async (id, organisationId) => {
  return await prisma.scrapRecord.findFirst({
    where: { id, ownerId: organisationId },
    include: { category: true }
  });
};

export const updateScrap = async (id, data, organisationId) => {
  // Verify ownership before updating
  const existing = await getScrapById(id, organisationId);
  if (!existing) {
    throw notFoundError();
  }

  const updateData = pickScrapFields(data);

  // Recalculate available quantity if totalQuantityKg is modified
  if (updateData.totalQuantityKg !== undefined) {
    const listed = Number(existing.listedQuantityKg || 0);
    const sold = Number(existing.soldQuantityKg || 0);
    const available = Number(updateData.totalQuantityKg) - listed - sold;

    if (available < 0) {
      throw new Error(
        `Total quantity cannot be less than the already listed and sold quantity (${listed + sold} kg)`
      );
    }

    updateData.availableQuantityKg = available;
  }

  const result = await prisma.scrapRecord.updateMany({
    where: { id, ownerId: organisationId },
    data: updateData
  });

  if (result.count === 0) {
    throw notFoundError();
  }

  return await prisma.scrapRecord.findUnique({
    where: { id },
    include: { category: true }
  });
};

export const deleteScrap = async (id, organisationId) => {
  const result = await prisma.scrapRecord.deleteMany({
    where: { id, ownerId: organisationId }
  });

  if (result.count === 0) {
    throw notFoundError();
  }
};

export const convertSaleToInventory = async (saleId, organisationId, userId) => {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      listing: {
        include: {
          scrapRecord: true
        }
      }
    }
  });

  if (!sale) {
    const err = new Error('Sale record not found');
    err.statusCode = 404;
    throw err;
  }

  if (sale.buyerId !== organisationId) {
    const err = new Error('Unauthorized to convert this sale to inventory');
    err.statusCode = 403;
    throw err;
  }

  const existingInventory = await prisma.scrapRecord.findUnique({
    where: { sourceSaleId: saleId }
  });

  if (existingInventory) {
    return existingInventory;
  }

  const categoryId = sale.listing.scrapRecord.categoryId;
  const description = `Purchased via Sale #${sale.id.slice(0, 8)} - ${sale.listing.scrapRecord.description || 'Scrap Material'}`;
  const condition = sale.listing.scrapRecord.condition || 'USED';

  return await prisma.scrapRecord.create({
    data: {
      ownerId: organisationId,
      categoryId: categoryId,
      description: description,
      condition: condition,
      totalQuantityKg: sale.quantityKg,
      availableQuantityKg: sale.quantityKg,
      listedQuantityKg: 0,
      soldQuantityKg: 0,
      status: 'AVAILABLE',
      sourceSaleId: saleId,
      createdByUserId: userId
    },
    include: { category: true }
  });
};

