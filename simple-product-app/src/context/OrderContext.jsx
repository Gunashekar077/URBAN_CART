import { createContext, useContext, useState, useEffect } from 'react';
import { orderService } from '../services/api';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load orders from localStorage as initial fallback, then fetch from API
  useEffect(() => {
    const cachedOrders = localStorage.getItem('urbancart_orders');
    if (cachedOrders) {
      try {
        setOrders(JSON.parse(cachedOrders));
      } catch (e) {
        console.error('Error parsing cached orders', e);
      }
    }
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
      localStorage.setItem('urbancart_orders', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Failed to retrieve order history.');
    } finally {
      setIsLoading(false);
    }
  };

  const placeOrder = async (products, pricingDetails, shippingDetails, paymentMethod) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        products,
        shippingDetails,
        paymentMethod,
        pricingDetails
      };
      
      const newOrder = await orderService.createOrder(
        payload.products, 
        payload.pricingDetails, 
        payload.shippingDetails, 
        payload.paymentMethod
      );
      // Update local state
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      setCurrentOrder(newOrder);
      localStorage.setItem('urbancart_orders', JSON.stringify(updatedOrders));
      
      setIsLoading(false);
      return newOrder;
    } catch (err) {
      setIsLoading(false);
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const applyCoupon = (code, subtotal) => {
    if (!code) return { success: false, discount: 0, message: '' };
    
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'SAVE10') {
      const discount = parseFloat((subtotal * 0.10).toFixed(2));
      return {
        success: true,
        discount,
        message: 'Coupon applied successfully! You got 10% off.'
      };
    } else {
      return {
        success: false,
        discount: 0,
        message: 'Invalid coupon code.'
      };
    }
  };

  const getOrderById = async (id) => {
    // Check local state first
    const found = orders.find(o => String(o.id) === String(id));
    if (found) return found;

    // Fetch from backend
    try {
      const data = await orderService.getOrderById(id);
      return data;
    } catch (err) {
      console.error('Error fetching single order:', err);
      throw err;
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      currentOrder,
      setCurrentOrder,
      isLoading,
      error,
      fetchOrders,
      placeOrder,
      applyCoupon,
      getOrderById
    }}>
      {children}
    </OrderContext.Provider>
  );
};
