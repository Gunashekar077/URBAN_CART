import { 
  createOrder as insertOrder, 
  getOrdersByUserId, 
  getAllOrders, 
  getOrderById as findOrderById,
  getCart,
  clearCart,
  getProductById,
  updateProduct
} from '../config/dataStore.js';

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { 
      products: bodyProducts, 
      shippingDetails, 
      paymentMethod, 
      pricingDetails 
    } = req.body;
    
    let orderItems = [];

    // If products are passed in the body, use them; otherwise, pull from the user's cart
    if (bodyProducts && bodyProducts.length > 0) {
      orderItems = bodyProducts;
    } else {
      const cartItems = getCart(req.user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'No items in cart to place an order' });
      }
      
      // Map cart items to full details
      for (const item of cartItems) {
        const product = getProductById(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        }
        orderItems.push({
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: item.quantity,
          image: product.image
        });
      }
    }

    // Verify stock and decrement
    for (const item of orderItems) {
      const dbProduct = getProductById(item.productId || item.id);
      if (!dbProduct) {
        return res.status(404).json({ message: `Product ${item.title || item.productId} not found` });
      }
      
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${dbProduct.title}. Available: ${dbProduct.stock}, Requested: ${item.quantity}` 
        });
      }
    }

    // Decrement stock
    for (const item of orderItems) {
      const dbProduct = getProductById(item.productId || item.id);
      updateProduct(dbProduct.id, { stock: dbProduct.stock - item.quantity });
    }

    // Calculate details if not provided in body
    const calculatedSubtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalPricingDetails = pricingDetails || {
      subtotal: calculatedSubtotal,
      shippingFee: calculatedSubtotal > 200 ? 0 : 5.99,
      tax: calculatedSubtotal * 0.08,
      discount: 0,
      grandTotal: calculatedSubtotal + (calculatedSubtotal > 200 ? 0 : 5.99) + (calculatedSubtotal * 0.08)
    };

    // Create the order
    const order = insertOrder(
      req.user.id, 
      orderItems, 
      finalPricingDetails, 
      shippingDetails, 
      paymentMethod
    );

    // Clear user's cart after order is placed
    clearCart(req.user.id);

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error placing order' });
  }
};

// @desc    Get logged in user orders (or all orders if admin)
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    let list;
    if (req.user.role === 'admin') {
      list = getAllOrders();
    } else {
      list = getOrdersByUserId(req.user.id);
    }
    res.json(list);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = findOrderById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization: must be the order owner or an admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error fetching order details' });
  }
};
