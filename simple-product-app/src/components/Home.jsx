import { Link } from "react-router-dom";
import "../App.css";

const Home = () => {
  return (
    <div className="home-text-container">
      <h1>Welcome to Our Store</h1>
      <p>
        Discover amazing products at unbeatable prices. Browse our collection of
        high-quality items, from electronics to fashion, and find everything you
        need in one place. Start shopping now and enjoy a seamless online
        experience!
      </p>
      <Link to="/products" className="cta-button">
        Shop Now
      </Link>
    </div>
  );
};
export default Home;
