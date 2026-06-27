import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { FaArrowLeft, FaReceipt, FaTag, FaCreditCard, FaBuildingColumns, FaMobileScreen, FaTruck } from 'react-icons/fa6';
import '../App.css';
import './CheckoutSystem.css';

const Checkout = ({ cartItems, onClearCart }) => {
  const navigate = useNavigate();
  const { placeOrder, applyCoupon } = useOrders();

  // Shipping Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);

  // Form Validation & Submission State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 200 || subtotal === 0 ? 0 : 5.99;
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const grandTotal = parseFloat((subtotal - discount + shippingFee + tax).toFixed(2));

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    const result = applyCoupon(couponCode, subtotal);
    setCouponSuccess(result.success);
    setCouponMessage(result.message);
    if (result.success) {
      setDiscount(result.discount);
      setAppliedCoupon(couponCode.trim().toUpperCase());
    } else {
      setDiscount(0);
      setAppliedCoupon('');
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!fullName.trim()) tempErrors.fullName = 'Full Name is required';
    
    if (!email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Enter a valid email address';
    }

    if (!phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone.trim().replace(/[-\s()]/g, ''))) {
      tempErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (!addressLine1.trim()) tempErrors.addressLine1 = 'Address Line 1 is required';
    if (!city.trim()) tempErrors.city = 'City is required';
    if (!state.trim()) tempErrors.state = 'State is required';
    
    if (!pincode.trim()) {
      tempErrors.pincode = 'Pincode is required';
    } else if (!/^\d{5,6}$/.test(pincode.trim())) {
      tempErrors.pincode = 'Enter a valid 5 or 6 digit pincode';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setApiError('');

    try {
      const shippingDetails = {
        fullName,
        email,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        pincode
      };

      const pricingDetails = {
        subtotal,
        shippingFee,
        tax,
        discount,
        grandTotal
      };

      const productsPayload = cartItems.map(item => ({
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      // Call Context Place Order
      const createdOrder = await placeOrder(
        productsPayload,
        pricingDetails,
        shippingDetails,
        paymentMethod
      );

      // Clear the cart
      if (onClearCart) {
        onClearCart();
      }

      // Navigate to success page
      navigate(`/order-success/${createdOrder.id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setApiError(err.message || 'Error occurred while placing the order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container text-center">
        <h2>Checkout Empty</h2>
        <p>No items in your cart to checkout.</p>
        <Link to="/products" className="cta-button margin-top-sm">
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      
      {/* Back button */}
      <Link to="/cart" className="back-link">
        <FaArrowLeft /> Back to Cart
      </Link>

      <h2 className="orders-history-header">Secure Checkout</h2>

      {apiError && (
        <div className="notification-error" style={{
          position: 'static',
          transform: 'none',
          marginBottom: '24px',
          whiteSpace: 'normal',
          borderRadius: '8px'
        }}>
          {apiError}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="checkout-grid-layout">
        
        {/* Left Column: Form & Payment */}
        <div className="cart-items" style={{ gap: '32px', margin: 0 }}>
          
          {/* Shipping Form Card */}
          <div className="checkout-card">
            <h3 className="card-section-title">
              Shipping Information
            </h3>
            
            <form className="signin-form" style={{ gap: '18px' }} onSubmit={(e) => e.preventDefault()}>
              <div className="form-row-responsive">
                <div className="form-group">
                  <label className="form-input-label">Full Name *</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); if(errors.fullName) delete errors.fullName; }}
                      className={`checkout-input ${errors.fullName ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-input-label">Email Address *</label>
                  <div className="input-wrapper">
                    <input 
                      type="email" 
                      placeholder="john@example.com" 
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if(errors.email) delete errors.email; }}
                      className={`checkout-input ${errors.email ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-input-label">Phone Number *</label>
                <div className="input-wrapper">
                  <input 
                    type="tel" 
                    placeholder="1234567890" 
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); if(errors.phone) delete errors.phone; }}
                    className={`checkout-input ${errors.phone ? 'input-error' : ''}`}
                  />
                </div>
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="form-input-label">Address Line 1 *</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    placeholder="House/Flat No., Building, Street Name" 
                    value={addressLine1}
                    onChange={(e) => { setAddressLine1(e.target.value); if(errors.addressLine1) delete errors.addressLine1; }}
                    className={`checkout-input ${errors.addressLine1 ? 'input-error' : ''}`}
                  />
                </div>
                {errors.addressLine1 && <span className="error-text">{errors.addressLine1}</span>}
              </div>

              <div className="form-group">
                <label className="form-input-label">Address Line 2</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Apartment, Land Mark, Locality" 
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="checkout-input"
                  />
                </div>
              </div>

              <div className="form-row-responsive-three">
                <div className="form-group">
                  <label className="form-input-label">City *</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      placeholder="City" 
                      value={city}
                      onChange={(e) => { setCity(e.target.value); if(errors.city) delete errors.city; }}
                      className={`checkout-input ${errors.city ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label className="form-input-label">State *</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      placeholder="State" 
                      value={state}
                      onChange={(e) => { setState(e.target.value); if(errors.state) delete errors.state; }}
                      className={`checkout-input ${errors.state ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.state && <span className="error-text">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label className="form-input-label">Pincode *</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      placeholder="Pincode" 
                      value={pincode}
                      onChange={(e) => { setPincode(e.target.value); if(errors.pincode) delete errors.pincode; }}
                      className={`checkout-input ${errors.pincode ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                </div>
              </div>
            </form>

          </div>

          {/* Payment Methods Card */}
          <div className="checkout-card">
            <h3 className="card-section-title">
              Payment Method
            </h3>

            <div className="payment-grid-responsive">
              
              <div 
                onClick={() => setPaymentMethod('cod')}
                className={`payment-option-card ${paymentMethod === 'cod' ? 'active' : ''}`}
              >
                <FaTruck className="payment-card-icon" />
                <div className="payment-card-details">
                  <p className="payment-card-title">Cash on Delivery</p>
                  <p className="payment-card-subtitle">Pay cash when delivered</p>
                </div>
              </div>

              <div 
                onClick={() => setPaymentMethod('upi')}
                className={`payment-option-card ${paymentMethod === 'upi' ? 'active' : ''}`}
              >
                <FaMobileScreen className="payment-card-icon" />
                <div className="payment-card-details">
                  <p className="payment-card-title">UPI / QR</p>
                  <p className="payment-card-subtitle">GPay, PhonePe, Paytm</p>
                </div>
              </div>

              <div 
                onClick={() => setPaymentMethod('card')}
                className={`payment-option-card ${paymentMethod === 'card' ? 'active' : ''}`}
              >
                <FaCreditCard className="payment-card-icon" />
                <div className="payment-card-details">
                  <p className="payment-card-title">Credit / Debit Card</p>
                  <p className="payment-card-subtitle">Visa, Mastercard, RuPay</p>
                </div>
              </div>

              <div 
                onClick={() => setPaymentMethod('net_banking')}
                className={`payment-option-card ${paymentMethod === 'net_banking' ? 'active' : ''}`}
              >
                <FaBuildingColumns className="payment-card-icon" />
                <div className="payment-card-details">
                  <p className="payment-card-title">Net Banking</p>
                  <p className="payment-card-subtitle">Direct pay from bank acc</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div>
          
          {/* Summary Card */}
          <div className="checkout-card-sticky">
            <h3 className="card-section-title">
              Order Summary
            </h3>

            {/* List of items inside checkout */}
            <div className="checkout-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-item-row">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="checkout-item-thumbnail"
                  />
                  <div className="checkout-item-meta">
                    <p className="checkout-item-title">{item.title}</p>
                    <p className="checkout-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <div className="checkout-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Application Box */}
            <div className="coupon-application-box">
              <p className="coupon-label">
                <FaTag /> Apply Promo Code (Example: SAVE10)
              </p>
              <div className="coupon-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Enter code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="coupon-input-field"
                />
                <button 
                  type="button" 
                  onClick={handleApplyCoupon}
                  className="coupon-apply-btn"
                >
                  Apply
                </button>
              </div>
              {couponMessage && (
                <p className="coupon-status-msg" style={{ 
                  color: couponSuccess ? '#10b981' : '#ef4444'
                }}>
                  {couponMessage}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="pricing-breakdown-panel">
              <div className="pricing-row">
                <span className="pricing-row-label">Items Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="pricing-row-discount">
                  <span>Discount ({appliedCoupon})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="pricing-row">
                <span className="pricing-row-label">Shipping Fee</span>
                <span>{shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
              </div>

              <div className="pricing-row">
                <span className="pricing-row-label">Estimated Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="pricing-row-total">
                <span>Grand Total</span>
                <span className="pricing-row-total-value">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order button */}
            <button 
              type="button" 
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="place-order-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <div className="btn-spinner" style={{ width: '18px', height: '18px' }}></div>
                  Placing Order...
                </>
              ) : (
                <>
                  <FaReceipt /> Place Order
                </>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Checkout;
