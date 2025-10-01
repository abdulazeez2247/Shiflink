const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
  role: { type: String, enum: ["admin", "agency", "dsp", "trainer", "county"], required: true },
  action: { type: String, required: true }, 
  targetModel: { type: String, required: true }, 
  targetId: { type: mongoose.Schema.Types.ObjectId }, 
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String }, 
  userAgent: { type: String }, 
  metadata: { type: Object }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
