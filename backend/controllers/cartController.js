import { getCart, saveCart, getProductById } from '../config/dataStore.js';

// Helper to populate cart items with full product details
const populateCartItems = (cartItems) => {
  return cartItems
    .map(item => {
      const product = getProductById(item.productId);
      if (!product) return null;
      return {
        id: product.id, // Keep the product id as id to match frontend
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: item.quantity,
        stock: product.stock
      };
    })
    .filter(item => item !== null);
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getUserCart = async (req, res) => {
  try {
    const cartItems = getCart(req.user.id);
    const populated = populateCartItems(cartItems);
    res.json(populated);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart/add
// @access  Private
export const addCartItem = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const cartItems = getCart(req.user.id);
    const existingIndex = cartItems.findIndex(item => String(item.productId) === String(productId));

    if (existingIndex > -1) {
      cartItems[existingIndex].quantity += parseInt(quantity) || 1;
    } else {
      cartItems.push({
        productId: String(productId),
        quantity: parseInt(quantity) || 1
      });
    }

    saveCart(req.user.id, cartItems);
    const populated = populateCartItems(cartItems);
    res.json(populated);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const cartItems = getCart(req.user.id);
    const existingIndex = cartItems.findIndex(item => String(item.productId) === String(productId));

    if (existingIndex > -1) {
      const parsedQty = parseInt(quantity);
      if (parsedQty <= 0) {
        // If quantity is set to 0 or negative, remove it
        cartItems.splice(existingIndex, 1);
      } else {
        cartItems[existingIndex].quantity = parsedQty;
      }
      saveCart(req.user.id, cartItems);
      const populated = populateCartItems(cartItems);
      res.json(populated);
    } else {
      res.status(404).json({ message: 'Product not found in cart' });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error updating cart' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
export const removeCartItem = async (req, res) => {
  try {
    // Support productId in body or as a query parameter
    const productId = req.body.productId || req.query.productId;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    let cartItems = getCart(req.user.id);
    const initialLength = cartItems.length;
    cartItems = cartItems.filter(item => String(item.productId) !== String(productId));

    if (cartItems.length < initialLength) {
      saveCart(req.user.id, cartItems);
      const populated = populateCartItems(cartItems);
      res.json(populated);
    } else {
      res.status(404).json({ message: 'Product not found in cart' });
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error removing from cart' });
  }
};
