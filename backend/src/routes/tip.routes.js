import express from 'express';
import { createOrder, verifyPayment, getTips, getStats } from '../controllers/tip.controller.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/', getTips);
router.get('/stats', getStats);

export default router;
