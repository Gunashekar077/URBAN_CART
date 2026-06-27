import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa6";
import { authService } from "../services/api";
import "./SignIn.css";

const SignIn = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  
  // Toggle between login and register
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Error and UI state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);

  const validate = () => {
    const newErrors = {};
    
    // Name validation (only if registering)
    if (isRegistering && !name.trim()) {
      newErrors.name = "Name is required";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    
    // Clear errors as user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError(null);

    try {
      let data;
      if (isRegistering) {
        data = await authService.register(name, email, password);
      } else {
        data = await authService.login(email, password);
      }
      
      setIsLoading(false);
      setIsSuccess(true);
      
      localStorage.setItem("isAuthenticated", "true");
      if (setIsAuthenticated) {
        setIsAuthenticated(true);
      }
      
      // Auto-navigate to home page after showing success animation
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      const message = err.response?.data?.message || `Failed to ${isRegistering ? 'register' : 'sign in'}. Please check your credentials.`;
      setApiError(message);
      console.error('Authentication Error:', err);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setName("");
    setEmail("");
    setPassword("");
    setErrors({});
    setApiError(null);
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        {isSuccess ? (
          <div className="success-checkmark">
            <div className="checkmark-circle">
              <FaCheck />
            </div>
            <h3>{isRegistering ? "Registered Successfully!" : "Signed In Successfully!"}</h3>
            <p>Redirecting you to the home page...</p>
          </div>
        ) : (
          <>
            <div className="signin-header">
              <h2>{isRegistering ? "Create Account" : "Welcome Back"}</h2>
              <p>{isRegistering ? "Join UrbanCart today" : "Sign in to continue to UrbanCart"}</p>
            </div>

            {apiError && (
              <div className="error-alert" style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.9rem',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                textAlign: 'center'
              }}>
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="signin-form" noValidate>
              {isRegistering && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={errors.name ? "input-error" : ""}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "input-error" : ""}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={errors.password ? "input-error" : ""}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <button
                type="submit"
                className="signin-submit-btn"
                disabled={isLoading}
                style={{ marginTop: '10px' }}
              >
                {isLoading ? (
                  <>
                    <div className="btn-spinner"></div>
                    {isRegistering ? "Registering..." : "Signing in..."}
                  </>
                ) : (
                  isRegistering ? "Register" : "Sign In"
                )}
              </button>
            </form>

            <div className="signup-prompt" style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
              <button 
                onClick={toggleMode} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#6366f1', 
                  cursor: 'pointer', 
                  fontWeight: '600',
                  padding: 0,
                  fontSize: '0.9rem'
                }}
              >
                {isRegistering ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignIn;
