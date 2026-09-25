import mongoose from 'mongoose';

const tipSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  message: {
    type: String,
    trim: true,
    maxlength: 200,
    default: '',
  },
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
  },
  razorpaySignature: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  streamerId: {
    type: String,
    default: 'meddplays',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Tip = mongoose.model('Tip', tipSchema);
export default Tip;
