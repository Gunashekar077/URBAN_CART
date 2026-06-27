import { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import "../App.css";

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`notification notification-${type}`}>
      <FaCheckCircle className="notification-icon" />
      <p>{message}</p>
    </div>
  );
};

export default Notification;
