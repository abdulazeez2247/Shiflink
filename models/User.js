const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^\S+@\S+\.\S+$/,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          // Basic international format: +[country code][number], e.g., +14155552671
          return /^\+\d{1,4}\d{6,14}$/.test(v); // +1 to +4 digits country code
        },
        message: (props) =>
          `${props.value} is not a valid international phone number!`,
      },
    },
    role: {
      type: String,
      enum: ["dsp", "agency", "trainer", "county"],
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    agreedToTOS: {
      type: Boolean,
      required: true,
      default: false,
    },
    agreedToAntiCircumvention: {
      type: Boolean,
      required: true,
      default: false,
    },
    complianceStatus: {
      isComplete: { type: Boolean, default: false },
      expiryDate: Date,
    },
  },
  { timestamps: true }
);

// Hash password pre-save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", UserSchema);
