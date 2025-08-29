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
          
          return /^(\+?\d{1,3}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?){1,5}\d{1,4}$/.test(
            v
          );
        },
        message: (props) =>
          `${props.value} is not a valid phone number format!`,
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

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model("User", UserSchema);
