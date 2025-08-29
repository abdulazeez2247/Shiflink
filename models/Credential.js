const mongoose = require("mongoose");

const CredentialSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { 
      type: String, 
      required: true, 
      trim: true
    },
    documentUrl: { 
      type: String, 
      required: true 
    },
    issuedDate: { 
      type: Date, 
      required: [true, "Issued date is required for credentials"] 
    },
    expiryDate: { 
      type: Date 
    },
    issuingAuthority: { 
      type: String, 
      trim: true, 
      required: [true, "Issuing authority is required"] 
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    notes: { 
      type: String, 
      trim: true 
    },

    // 🔹 Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date
    }
  },
  { timestamps: true }
);


CredentialSchema.pre("save", function(next) {
  if (this.expiryDate && new Date() > this.expiryDate) {
    this.verificationStatus = "rejected"; // Or "expired"
  }
  next();
});


CredentialSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

module.exports = mongoose.model("Credential", CredentialSchema);
