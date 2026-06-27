import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Home from "./components/Home";
import Products from "./components/Products";
import Cart from "./components/Cart";
import Orders from "./components/Orders";
import Checkout from "./components/Checkout";
import OrderSuccess from "./components/OrderSuccess";
import AdminDashboard from "./components/AdminDashboard";
import Notification from "./components/Notification";
import SignIn from "./components/SignIn";
import { authService, cartService } from "./services/api";
import { OrderProvider } from "./context/OrderContext";
import { PulseLoader } from "react-spinners";
import "./App.css";

const NotFound = () => <p>404 Not Found</p>;

// Route Guard component for logged-in users
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Route Guard component for Admin users only
const AdminRoute = ({ isAuthenticated, currentUser, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (currentUser && currentUser.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true" && !!localStorage.getItem("token");
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Load user profile if authenticated
  const loadUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const user = await authService.getProfile();
        setCurrentUser(user);
        setIsAuthenticated(true);
        // Sync cart after profile is loaded
        const cart = await cartService.getCart();
        setCartItems(cart);
      } catch (err) {
        console.error("Profile load failed, logging out:", err);
        handleLogout();
      } finally {
        setIsLoadingProfile(false);
      }
    } else {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Fetch cart details on auth state changes
  useEffect(() => {
    if (isAuthenticated && localStorage.getItem("token")) {
      // Reload profile if we don't have it yet
      if (!currentUser) {
        loadUserProfile();
      } else {
        cartService.getCart()
          .then(cart => setCartItems(cart))
          .catch(err => console.error("Error fetching cart:", err));
      }
    }
  }, [isAuthenticated]);

  const addToCart = async (product) => {
    try {
      const updatedCart = await cartService.addCartItem(product.id, 1);
      setCartItems(updatedCart);
      setNotification({
        message: `${product.title} added to cart!`,
        type: "success",
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
      setNotification({
        message: "Failed to add item to cart. Please try again.",
        type: "error",
      });
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      let updatedCart;
      if (newQuantity <= 0) {
        updatedCart = await cartService.removeCartItem(productId);
        setNotification({
          message: "Item removed from cart",
          type: "success",
        });
      } else {
        updatedCart = await cartService.updateCartItem(productId, newQuantity);
      }
      setCartItems(updatedCart);
    } catch (err) {
      console.error("Error updating quantity:", err);
      setNotification({
        message: err.response?.data?.message || "Failed to update quantity.",
        type: "error",
      });
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const updatedCart = await cartService.removeCartItem(productId);
      setCartItems(updatedCart);
      setNotification({
        message: "Item removed from cart",
        type: "success",
      });
    } catch (err) {
      console.error("Error removing from cart:", err);
      setNotification({
        message: "Failed to remove item. Please try again.",
        type: "error",
      });
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCartItems([]);
  };

  if (isLoadingProfile) {
    return (
      <div className="loader-container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#0b0f19"
      }}>
        <PulseLoader color="#6366f1" size={18} margin={4} />
      </div>
    );
  }

  return (
    <OrderProvider>
      <div className="app">
        <Header 
          cartItems={cartItems} 
          isAuthenticated={isAuthenticated} 
          currentUser={currentUser}
          onLogout={handleLogout} 
        />
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? <Navigate to="/home" replace /> : <SignIn setIsAuthenticated={setIsAuthenticated} />
              } 
            />
            <Route 
              path="/signin" 
              element={
                isAuthenticated ? <Navigate to="/home" replace /> : <SignIn setIsAuthenticated={setIsAuthenticated} />
              } 
            />
            
            <Route 
              path="/home" 
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Products onAddToCart={addToCart} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Cart 
                    cartItems={cartItems} 
                    onRemoveFromCart={removeFromCart} 
                    onUpdateQuantity={updateQuantity}
                    onClearCart={clearCart}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Checkout cartItems={cartItems} onClearCart={clearCart} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-success/:orderId"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <OrderSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute isAuthenticated={isAuthenticated} currentUser={currentUser}>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </OrderProvider>
  );
};
export default App;
