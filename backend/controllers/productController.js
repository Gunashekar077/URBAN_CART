import { 
  getProducts as getAllProducts, 
  getProductById as findProductById, 
  createProduct as insertProduct, 
  updateProduct as editProduct, 
  deleteProduct as removeProduct 
} from '../config/dataStore.js';

// @desc    Get all products (with search, category filter, and price sort)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    let list = [...getAllProducts()];
    const { search, category, sort } = req.query;

    // 1. Search filter
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      list = list.filter(p => 
        (p.title && p.title.toLowerCase().includes(searchLower)) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    // 2. Category filter
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      list = list.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
    }

    // 3. Price sorting
    if (sort) {
      if (sort === 'price_asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_desc') {
        list.sort((a, b) => b.price - a.price);
      }
    }

    res.json(list);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = findProductById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, image, stock } = req.body;

    if (!title || price === undefined) {
      return res.status(400).json({ message: 'Title and price are required' });
    }

    const newProduct = insertProduct({
      title,
      description,
      price,
      category,
      image,
      stock
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const updated = editProduct(req.params.id, req.body);
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const deleted = removeProduct(req.params.id);
    if (deleted) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};
