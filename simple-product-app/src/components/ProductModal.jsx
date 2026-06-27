import { FaStar, FaXmark } from "react-icons/fa6";
import "../App.css";

const ProductModal = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card">
        <button className="close-modal-btn" onClick={onClose} aria-label="Close modal">
          <FaXmark />
        </button>
        <div className="modal-image-section">
          <img src={product.image} alt={product.title} />
        </div>
        <div className="modal-details-section">
          <span className="modal-category">{product.category}</span>
          <h2 className="modal-title">{product.title}</h2>
          
          <div className="modal-rating-row">
            <div className="modal-stars">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`star-icon ${
                    i < Math.round(product.rating?.rate || 0) ? "active" : ""
                  }`}
                />
              ))}
            </div>
            <span className="modal-rating-value">{product.rating?.rate || 0} / 5</span>
            <span className="modal-rating-count">({product.rating?.count || 0} reviews)</span>
          </div>

          <p className="modal-description">{product.description}</p>
          
          <div className="modal-price-btn-row">
            <span className="modal-price">${product.price.toFixed(2)}</span>
            <button
              className="modal-add-btn"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
