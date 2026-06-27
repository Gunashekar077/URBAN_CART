import bcrypt from 'bcryptjs';

// In-memory "tables"
const users = [];
const products = [];
const carts = {}; // Map of userId -> array of { productId, quantity }
const orders = [];

// Helper to generate unique string IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Initialize data store with default users
const initializeUsers = async () => {
  if (users.length === 0) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    
    users.push({
      id: 'admin_user_id',
      name: 'Admin User',
      email: 'admin@urbancart.com',
      password: adminPassword,
      role: 'admin'
    });
    
    users.push({
      id: 'test_user_id',
      name: 'Test User',
      email: 'user@urbancart.com',
      password: userPassword,
      role: 'user'
    });
    
    console.log('In-memory users initialized successfully.');
  }
};

// Users functions
export const getUserByEmail = (email) => {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const getUserById = (id) => {
  const user = users.find(u => u.id === id);
  if (!user) return null;
  // Exclude password in return
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: generateId(),
    name,
    email,
    password: hashedPassword,
    role
  };
  users.push(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Products functions
export const getProducts = () => {
  return products;
};

export const getProductById = (id) => {
  return products.find(p => String(p.id) === String(id));
};

export const createProduct = (productData) => {
  const newProduct = {
    id: generateId(), // String ID for custom added products
    title: productData.title,
    description: productData.description || '',
    price: parseFloat(productData.price) || 0,
    category: productData.category || 'General',
    image: productData.image || 'https://via.placeholder.com/150',
    stock: parseInt(productData.stock) || 50,
    rating: {
      rate: 4.5,
      count: 10
    }
  };
  products.push(newProduct);
  return newProduct;
};

export const updateProduct = (id, productData) => {
  const index = products.findIndex(p => String(p.id) === String(id));
  if (index === -1) return null;
  
  const updatedProduct = {
    ...products[index],
    title: productData.title !== undefined ? productData.title : products[index].title,
    description: productData.description !== undefined ? productData.description : products[index].description,
    price: productData.price !== undefined ? parseFloat(productData.price) : products[index].price,
    category: productData.category !== undefined ? productData.category : products[index].category,
    image: productData.image !== undefined ? productData.image : products[index].image,
    stock: productData.stock !== undefined ? parseInt(productData.stock) : products[index].stock,
  };
  
  products[index] = updatedProduct;
  return updatedProduct;
};

export const deleteProduct = (id) => {
  const index = products.findIndex(p => String(p.id) === String(id));
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
};

// Cart functions
export const getCart = (userId) => {
  if (!carts[userId]) {
    carts[userId] = [];
  }
  return carts[userId];
};

export const saveCart = (userId, cartItems) => {
  carts[userId] = cartItems.map(item => ({
    productId: item.productId,
    quantity: parseInt(item.quantity) || 1
  }));
  return carts[userId];
};

export const clearCart = (userId) => {
  carts[userId] = [];
  return [];
};

// Orders functions
export const createOrder = (userId, orderItems, pricingDetails, shippingDetails, paymentMethod) => {
  const newOrder = {
    id: 'ord_' + generateId(),
    userId,
    products: orderItems.map(item => ({
      productId: item.productId || item.id,
      title: item.title,
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity) || 1,
      image: item.image || ''
    })),
    subtotal: parseFloat(pricingDetails.subtotal) || 0,
    shippingFee: parseFloat(pricingDetails.shippingFee) || 0,
    tax: parseFloat(pricingDetails.tax) || 0,
    discount: parseFloat(pricingDetails.discount) || 0,
    totalAmount: parseFloat(pricingDetails.grandTotal) || parseFloat(pricingDetails.subtotal) || 0,
    shippingDetails: shippingDetails || {},
    paymentMethod: paymentMethod || 'cod',
    orderStatus: 'Processing',
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  return newOrder;
};

export const getOrdersByUserId = (userId) => {
  return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getAllOrders = () => {
  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getOrderById = (id) => {
  return orders.find(o => o.id === id);
};

export { users, products, carts, orders, initializeUsers };
