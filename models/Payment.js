const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // Total amount paid
  currency: { 
    type: String, 
    default: 'USD', 
    uppercase: true,
    match: /^[A-Z]{3}$/ 
  },
  breakdown: {
    platformFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 } 
  },
  method: { type: String, enum: ['stripe', 'square'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: { type: String },
  notes: { type: String }
}, { timestamps: true });


PaymentSchema.pre('save', function (next) {
  this.breakdown.netAmount = this.amount - (this.breakdown.platformFee || 0) - (this.breakdown.tax || 0);
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
