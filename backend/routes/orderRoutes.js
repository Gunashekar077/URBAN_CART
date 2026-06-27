import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById 
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createOrder)
  .get(getOrders);

router.route('/:id')
  .get(getOrderById);

export default router;
