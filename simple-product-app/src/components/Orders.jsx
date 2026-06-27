import { useEffect } from 'react';
import { PulseLoader } from 'react-spinners';
import { FaBagShopping, FaLocationDot, FaCreditCard, FaTruckFast } from 'react-icons/fa6';
import { useOrders } from '../context/OrderContext';
import '../App.css';
import './CheckoutSystem.css';

const Orders = () => {
  const { orders, isLoading, error, fetchOrders } = useOrders();

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (isoString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(isoString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.25)' };
      case 'out for delivery':
      case 'shipped':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.25)' };
      case 'cancelled':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.25)' };
      default: // processing / pending
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' };
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'upi': return 'UPI / QR Payment';
      case 'card': return 'Credit/Debit Card';
      case 'net_banking': return 'Net Banking';
      default: return 'Cash on Delivery';
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="loader-container">
        <PulseLoader color="#6366f1" size={15} margin={3} />
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="cart-container" style={{ minHeight: '60vh' }}>
        <p style={{ color: '#ef4444', fontSize: '1.2rem', fontWeight: '600' }}>{error}</p>
        <button onClick={fetchOrders} className="cta-button" style={{ marginTop: '20px', border: 'none', cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="cart-container" style={{ minHeight: '60vh' }}>
        <FaBagShopping className="cart-icon" style={{ animation: 'floatCart 3s ease-in-out infinite' }} />
        <h2>Your Orders</h2>
        <p>You haven't placed any orders yet. Browse our store to make your first purchase!</p>
        <a href="/products" className="cta-button" style={{ marginTop: '10px' }}>
          Shop Products
        </a>
      </div>
    );
  }

  return (
    <div className="cart-container" style={{ justifyContent: 'flex-start', minHeight: 'calc(100vh - 120px)', maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '40px 20px' }}>
      <h2 className="orders-history-header">Order History</h2>
      
      <div className="cart-items" style={{ width: '100%', gap: '28px' }}>
        {orders.map((order) => {
          const colors = getStatusColor(order.orderStatus);
          return (
            <div key={order.id} className="cart-item order-history-card-item">
              
              {/* Card Header */}
              <div className="order-card-row">
                <div>
                  <p className="order-meta-label">ORDER ID</p>
                  <p className="order-meta-value-highlight">#{order.id}</p>
                </div>
                <div>
                  <p className="order-meta-label">DATE PLACED</p>
                  <p className="order-meta-value">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <span className="status-badge" style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`
                  }}>
                    {order.orderStatus || 'Processing'}
                  </span>
                </div>
              </div>

              {/* Items Summary Grid */}
              <div className="order-card-items-panel">
                {order.products?.map((item, idx) => (
                  <div key={idx} className="order-item-detail-row">
                    <img 
                      src={item.image || 'https://via.placeholder.com/80'} 
                      alt={item.title} 
                      className="order-item-thumbnail"
                    />
                    <div className="order-item-info">
                      <p className="order-item-title">{item.title}</p>
                      <p className="order-item-subtitle">
                        Quantity: {item.quantity} &times; ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="order-item-subtotal">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Advanced Invoice Info */}
              <div className="order-footer-details">
                
                {/* Shipping & Payment Meta */}
                <div className="order-footer-left">
                  <div className="order-footer-left-row">
                    <FaLocationDot style={{ color: 'var(--primary)', marginTop: '3px', fontSize: '0.9rem' }} />
                    <div>
                      <strong className="order-footer-left-label">SHIPPING TO:</strong>
                      <p className="order-footer-left-val">
                        {order.shippingDetails?.fullName || 'N/A'}, {order.shippingDetails?.addressLine1 || 'N/A'}, {order.shippingDetails?.city || ''} {order.shippingDetails?.pincode || ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="order-footer-left-row-center">
                    <FaCreditCard style={{ color: 'var(--primary)', fontSize: '0.9rem' }} />
                    <div>
                      <strong className="order-footer-left-label">PAYMENT MODE: </strong>
                      <span style={{ fontWeight: '500' }}>{getPaymentMethodLabel(order.paymentMethod)}</span>
                    </div>
                  </div>
                </div>

                {/* Subtotals & Grand Total breakdown */}
                <div className="order-footer-right">
                  {order.subtotal !== undefined && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                        <span>${(order.subtotal || 0).toFixed(2)}</span>
                      </div>
                      
                      {order.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                          <span>Discount:</span>
                          <span>-${(order.discount || 0).toFixed(2)}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Shipping:</span>
                        <span>{order.shippingFee === 0 ? 'FREE' : `$${(order.shippingFee || 0).toFixed(2)}`}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Tax (8%):</span>
                        <span>${(order.tax || 0).toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  <div className="order-footer-right-total">
                    <span>Grand Total:</span>
                    <span className="order-footer-right-total-val">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
