import express from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware);

// Customer routes
router.post('/', [
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('ZIP code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required')
], createOrder);

router.get('/my-orders', getUserOrders);
router.get('/:id', getOrder);

// Admin routes
router.get('/', roleMiddleware('admin'), getAllOrders);
router.put('/:id/status', [
  roleMiddleware('admin'),
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], updateOrderStatus);

export default router;