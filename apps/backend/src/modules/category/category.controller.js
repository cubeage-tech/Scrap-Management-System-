import * as categoryService from './category.service.js';

// 1. List Active Categories (For Industry, Dealer, Buyer UI)
export const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 2. List All Categories (For Super Admin including inactive)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching all categories:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 3. Get Category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 4. Create Category (Super Admin)
export const createCategory = async (req, res) => {
  try {
    const { name, parentId, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await categoryService.createCategory({ name, parentId, isActive });
    res.status(201).json({ success: true, message: 'Category created successfully', data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 5. Update Category (Super Admin)
export const updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Category updated successfully', data: category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 6. Delete Category (Super Admin)
export const deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
