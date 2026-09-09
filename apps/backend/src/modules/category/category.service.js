import prisma from '../../core/lib/prisma.js';

export const getCategories = async () => {
  return await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });
};

export const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
};

export const getCategoryById = async (id) => {
  return await prisma.category.findUnique({
    where: { id }
  });
};

export const createCategory = async (data) => {
  const existing = await prisma.category.findFirst({
    where: { name: { equals: data.name.trim(), mode: "insensitive" } }
  });

  if (existing) {
    throw new Error(`Category "${data.name.trim()}" already exists`);
  }

  return await prisma.category.create({
    data: {
      name: data.name.trim(),
      parentId: data.parentId || null,
      isActive: data.isActive !== undefined ? data.isActive : true
    }
  });
};

export const updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.parentId !== undefined && { parentId: data.parentId }),
      ...(data.isActive !== undefined && { isActive: data.isActive })
    }
  });
};

export const deleteCategory = async (id) => {
  return await prisma.category.delete({
    where: { id }
  });
};
