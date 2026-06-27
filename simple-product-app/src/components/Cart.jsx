import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCartShopping, FaTrash } from "react-icons/fa6";
import { orderService } from "../services/api";
import "../App.css";

const Cart = ({ cartItems, onRemoveFromCart, onUpdateQuantity, onClearCart }) => {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <FaCartShopping className="cart-icon" />
        <h2>Your Cart</h2>
        <p>Your cart is currently empty. Start shopping to add items!</p>
        <a href="/products" className="cta-button">
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div className="cart-container" style={{ justifyContent: "flex-start", minHeight: "calc(100vh - 120px)", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
      <h2 style={{ alignSelf: "flex-start", marginBottom: "24px", fontSize: "2rem", fontWeight: "800" }}>Your Cart</h2>
      
      {checkoutError && (
        <div style={{
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          color: "#ef4444",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "0.9rem",
          border: "1px solid rgba(239, 68, 68, 0.25)",
          width: "100%",
          textAlign: "center"
        }}>
          {checkoutError}
        </div>
      )}

      <div className="cart-items" style={{ width: "100%" }}>
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.title} />
            <div className="cart-item-details">
              <p className="item-title">{item.title}</p>
              <p className="item-price">${item.price.toFixed(2)}</p>
              
              {/* Quantity selectors */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Quantity:</span>
                <button 
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.12)"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.05)"}
                >
                  -
                </button>
                <span style={{ fontWeight: "700", minWidth: "24px", textAlign: "center" }}>{item.quantity}</span>
                <button 
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.05)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.12)"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.05)"}
                >
                  +
                </button>
              </div>

              <p className="item-total" style={{ marginTop: "8px" }}>
                Total: ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
            <button
              className="remove-btn"
              onClick={() => onRemoveFromCart(item.id)}
              disabled={isCheckingOut}
            >
              <FaTrash /> Remove
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-summary" style={{ width: "100%" }}>
        <h3>Total Amount: ${totalAmount.toFixed(2)}</h3>
        <button 
          className="checkout-btn" 
          onClick={handleCheckout}
          disabled={isCheckingOut}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          {isCheckingOut ? (
            <>
              <div className="btn-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
              Processing...
            </>
          ) : (
            "Proceed to Checkout"
          )}
        </button>
      </div>
    </div>
  );
};

export default Cart;
