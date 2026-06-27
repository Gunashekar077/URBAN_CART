import express from 'express';
import { 
  getUserCart, 
  addCartItem, 
  updateCartItem, 
  removeCartItem 
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all cart routes
router.use(protect);

router.get('/', getUserCart);
router.post('/add', addCartItem);
router.put('/update', updateCartItem);
router.delete('/remove', removeCartItem);

export default router;
