import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { PulseLoader } from 'react-spinners';
import { FaCircleCheck, FaBagShopping, FaClock, FaLocationDot, FaCreditCard } from 'react-icons/fa6';
import '../App.css';
import './CheckoutSystem.css';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        const data = await getOrderById(orderId);
        setOrder(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching order for success screen:', err);
        setError('Order details could not be loaded, but your order has been placed.');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstimatedDeliveryDate = (isoString) => {
    const date = new Date(isoString);
    date.setDate(date.getDate() + 4); // Estimated 4 days delivery
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'upi': return 'UPI / QR Payment';
      case 'card': return 'Credit / Debit Card';
      case 'net_banking': return 'Net Banking';
      default: return 'Cash on Delivery';
    }
  };

  if (isLoading) {
    return (
      <div className="loader-container">
        <PulseLoader color="#6366f1" size={15} margin={3} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="cart-container" style={{ minHeight: '60vh', padding: '40px 20px' }}>
        <FaCircleCheck className="success-banner-checkmark" />
        <h2>Order Confirmed!</h2>
        <p className="order-meta-label">Order ID: #{orderId}</p>
        <p style={{ color: '#ef4444', margin: '20px 0' }}>{error || 'Unable to retrieve invoice details.'}</p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
          <Link to="/products" className="cta-button" style={{ textDecoration: 'none' }}>Continue Shopping</Link>
          <Link to="/orders" className="cta-button" style={{ textDecoration: 'none', backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'none' }}>
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      
      {/* Success Animation Banner */}
      <div className="success-banner-container">
        <div className="success-banner-checkmark">
          <FaCircleCheck />
        </div>
        <h2 className="success-banner-title">
          Order Placed Successfully!
        </h2>
        <p className="success-banner-subtitle">
          Thank you for your purchase. Your order has been logged under ID <strong className="pricing-row-total-value">#{order.id}</strong>.
        </p>
      </div>

      {/* Invoice Details Layout */}
      <div className="checkout-grid-layout" style={{ marginBottom: '40px' }}>
        
        {/* Left Side: Order Meta Details */}
        <div className="cart-items" style={{ gap: '20px', margin: 0 }}>
          
          {/* Estimated Delivery Card */}
          <div className="meta-info-card">
            <FaClock style={{ fontSize: '2rem', color: 'var(--primary)' }} />
            <div className="meta-info-card-text">
              <p className="meta-info-card-label">Estimated Delivery Date</p>
              <p className="meta-info-card-value">
                {getEstimatedDeliveryDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="address-info-card">
            <h4 className="address-info-card-title">
              <FaLocationDot style={{ color: 'var(--primary)' }} /> Shipping Address
            </h4>
            <div className="address-info-card-content">
              <p className="address-name">{order.shippingDetails?.fullName}</p>
              <p style={{ margin: 0 }}>{order.shippingDetails?.addressLine1}</p>
              {order.shippingDetails?.addressLine2 && <p style={{ margin: 0 }}>{order.shippingDetails?.addressLine2}</p>}
              <p style={{ margin: 0 }}>{order.shippingDetails?.city}, {order.shippingDetails?.state} - {order.shippingDetails?.pincode}</p>
              <p className="address-phone">Phone: {order.shippingDetails?.phone}</p>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="meta-info-card">
            <FaCreditCard style={{ fontSize: '2rem', color: 'var(--primary)' }} />
            <div className="meta-info-card-text">
              <p className="meta-info-card-label">Payment Mode</p>
              <p className="meta-info-card-value">
                {getPaymentMethodLabel(order.paymentMethod)}
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Order Items Receipt */}
        <div>
          <div className="receipt-summary-card">
            <h4 className="receipt-summary-title">
              <FaBagShopping style={{ color: 'var(--primary)' }} /> Order Summary
            </h4>

            {/* Product list */}
            <div className="receipt-items-list">
              {order.products?.map((item, idx) => (
                <div key={idx} className="receipt-item-row">
                  <div className="receipt-item-details">
                    <p className="receipt-item-title">{item.title}</p>
                    <p className="receipt-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <div className="receipt-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="receipt-pricing-panel">
              <div className="pricing-row">
                <span className="pricing-row-label">Subtotal</span>
                <span>${(order.subtotal || order.totalAmount).toFixed(2)}</span>
              </div>
              
              {order.discount > 0 && (
                <div className="pricing-row-discount">
                  <span>Discount</span>
                  <span>-${(order.discount || 0).toFixed(2)}</span>
                </div>
              )}

              <div className="pricing-row">
                <span className="pricing-row-label">Shipping Fee</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `$${(order.shippingFee || 0).toFixed(2)}`}</span>
              </div>

              <div className="pricing-row">
                <span className="pricing-row-label">Tax (8%)</span>
                <span>${order.tax ? order.tax.toFixed(2) : '0.00'}</span>
              </div>

              <div className="pricing-row-total">
                <span>Grand Total</span>
                <span className="pricing-row-total-value">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Primary Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <Link to="/products" className="cta-button" style={{ 
          textDecoration: 'none', 
          padding: '14px 32px'
        }}>
          Continue Shopping
        </Link>
        <Link to="/orders" className="cta-button" style={{ 
          textDecoration: 'none', 
          backgroundColor: 'rgba(255,255,255,0.08)', 
          color: '#fff', 
          border: '1px solid rgba(255,255,255,0.1)', 
          boxShadow: 'none',
          padding: '14px 32px'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.14)'}
        onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.08)'}>
          View Order History
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;
