import { Router } from 'express';
import authRoutes from './auth';
import { authenticate } from '../middleware/auth';
import * as establishments from '../controllers/establishmentsController';
import * as products from '../controllers/productsController';
import * as orders from '../controllers/ordersController';
import * as kitchen from '../controllers/kitchenController';
import * as payments from '../controllers/paymentsController';
import * as analytics from '../controllers/analyticsController';

const router = Router();

// Auth routes (no authentication required)
router.use('/auth', authRoutes);

// All routes below require authentication
router.use(authenticate);

// Establishments
router.get('/establishments', establishments.getEstablishments);
router.get('/establishments/:id', establishments.getEstablishmentById);

// Products
router.get('/products', products.getProducts);
router.post('/products', products.createProduct);
router.put('/products/:id', products.updateProduct);
router.delete('/products/:id', products.deleteProduct);

// Orders
router.get('/orders', orders.getOrders);
router.get('/orders/:id', orders.getOrderById);
router.post('/orders', orders.createOrder);
router.put('/orders/:id', orders.updateOrder);
router.post('/orders/:id/cancel', orders.cancelOrder);
router.post('/orders/:id/close', orders.closeOrder);

// Kitchen
router.get('/kitchen/tickets', kitchen.getKitchenTickets);
router.put('/kitchen/tickets/:id/status', kitchen.updateTicketStatus);

// Payments
router.post('/payments', payments.createPayment);
router.get('/payments/order/:order_id', payments.getPaymentsByOrder);

// Analytics
router.get('/analytics/dashboard', analytics.getDashboardMetrics);

export default router;
