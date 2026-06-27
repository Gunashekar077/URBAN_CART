import { Link } from "react-router-dom"
import { FaCartShopping, FaArrowRightFromBracket, FaReceipt, FaUserGear } from "react-icons/fa6";
import '../App.css';
import './CheckoutSystem.css';

const Header = ({ cartItems = [], isAuthenticated, currentUser, onLogout }) => {
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav className="header-nav">
            <Link to={isAuthenticated ? '/home' : '/'} className="header-logo-link">
                <p className="logo">UrbanCart</p>
            </Link>
            
            {isAuthenticated && (
                <div className="link-container header-links-wrapper">
                    
                    {/* User greeting */}
                    {currentUser && (
                        <span className="header-user-greeting">
                            Hello, <strong className="header-user-greeting-name">{currentUser.name}</strong>
                        </span>
                    )}

                    <Link to='/home'>Home</Link>
                    <Link to='/products'>Products</Link>
                    
                    <Link to='/orders' className="orders-nav-link">
                        <FaReceipt /> Orders
                    </Link>

                    {/* Admin Dashboard link */}
                    {currentUser?.role === 'admin' && (
                        <Link to='/admin' className="admin-nav-link">
                            <FaUserGear /> Admin
                        </Link>
                    )}

                    <Link to='/cart' className="cart-nav-link">
                        <FaCartShopping /> Cart
                        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                    </Link>

                    <button onClick={onLogout} className="logout-btn header-logout-btn" title="Logout">
                        <FaArrowRightFromBracket /> Logout
                    </button>
                </div>
            )}
        </nav>
    )
}
export default Header