import Razorpay from 'razorpay';
import crypto from 'crypto';
import Tip from '../models/Tip.model.js';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { amount, senderName, message } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    if (!senderName || senderName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Sender name is required' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `tip_${Date.now()}`,
      notes: {
        senderName: senderName.trim(),
        message: message || '',
      },
    });

    // Save pending tip to DB
    const tip = new Tip({
      senderName: senderName.trim(),
      amount: amount,
      message: message || '',
      razorpayOrderId: order.id,
      status: 'pending',
    });
    await tip.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
};

// Verify payment and emit real-time notification
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update tip record
    const tip = await Tip.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
      },
      { new: true }
    );

    if (!tip) {
      return res.status(404).json({ success: false, message: 'Tip record not found' });
    }

    // Emit real-time notification to streamer dashboard
    const io = req.app.get('io');
    io.to(`streamer-${tip.streamerId}`).emit('new-tip', {
      id: tip._id,
      senderName: tip.senderName,
      amount: tip.amount,
      message: tip.message,
      createdAt: tip.createdAt,
    });

    res.json({
      success: true,
      message: 'Payment verified successfully!',
      tip: {
        senderName: tip.senderName,
        amount: tip.amount,
        message: tip.message,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Payment verification error' });
  }
};

// Get all tips (for dashboard)
export const getTips = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'paid' } = req.query;
    const tips = await Tip.find({ status })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Tip.countDocuments({ status });

    res.json({
      success: true,
      tips,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Get tips error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tips' });
  }
};

// Get total earnings stats
export const getStats = async (req, res) => {
  try {
    const totalTips = await Tip.countDocuments({ status: 'paid' });
    const totalAmountResult = await Tip.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalAmount = totalAmountResult[0]?.total || 0;

    const topTips = await Tip.find({ status: 'paid' })
      .sort({ amount: -1 })
      .limit(5);

    const recentTips = await Tip.find({ status: 'paid' })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalTips,
        totalAmount,
        topTips,
        recentTips,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};
