// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const UserSchema = new mongoose.Schema(
//   {
//     first_name: {
//       type: String,
//       required: [true, "First name is required"],
//       trim: true
//     },
//     last_name: {
//       type: String,
//       required: [true, "Last name is required"],
//       trim: true
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
//     },
//     phone: {
//       type: String,
//       required: [true, "Phone number is required"],
//       validate: {
//         validator: function (v) {
//           return /^[\d\s\-\+\(\)]{10,20}$/.test(v);
//         },
//         message: props => `${props.value} is not a valid phone number!`
//       }
//     },
//     role: {
//       type: String,
//       required: [true, "Role is required"],
//       enum: ["dsp", "agency", "trainer", "county", "admin"],
//       lowercase: true
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: [8, "Password must be at least 8 characters long"]
//     },
//     agreedToTOS: {
//       type: Boolean,
//       required: [true, "You must agree to Terms of Service"],
//       default: false,
//       validate: {
//         validator: function(v) {
//           return v === true;
//         },
//         message: "You must agree to Terms of Service"
//       }
//     },
//     agreedToAntiCircumvention: {
//       type: Boolean,
//       required: [true, "You must agree to Anti-Circumvention policy"],
//       default: false,
//       validate: {
//         validator: function(v) {
//           return v === true;
//         },
//         message: "You must agree to Anti-Circumvention policy"
//       }
//     },
    
//     complianceStatus: {
//       isComplete: { type: Boolean, default: false },
//       expiryDate: Date
//     },
//   },
//   { 
//     timestamps: true,
//     toJSON: {
//       transform: function(doc, ret) {
//         delete ret.password;
//         delete ret.__v;
//         return ret;
//       }
//     }
//   }
// );

// // Remove the virtual confirmPassword as it's handled in controller
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
  
//   try {
//     this.password = await bcrypt.hash(this.password, 12);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// UserSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model("User", UserSchema);
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true
    },
    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^[\d\s\-\+\(\)]{10,20}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["dsp", "agency", "trainer", "county", "admin"],
      lowercase: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"]
    },
    agreedToTOS: {
      type: Boolean,
      required: [true, "You must agree to Terms of Service"],
      default: false,
      validate: {
        validator: function(v) {
          return v === true;
        },
        message: "You must agree to Terms of Service"
      }
    },
    agreedToAntiCircumvention: {
      type: Boolean,
      required: [true, "You must agree to Anti-Circumvention policy"],
      default: false,
      validate: {
        validator: function(v) {
          return v === true;
        },
        message: "You must agree to Anti-Circumvention policy"
      }
    },
    
    complianceStatus: {
      isComplete: { type: Boolean, default: false },
      expiryDate: Date
    },

    // DSP Application fields
    applicationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending'
    },
    appliedAgencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    approvedAgencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    applicationNotes: [{
      agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      note: String,
      date: {
        type: Date,
        default: Date.now
      },
      status: String
    }],
    experience: {
      type: String,
      trim: true
    },
    skills: [{
      type: String,
      trim: true
    }],
    certifications: [{
      type: String,
      trim: true
    }],

    // Agency-specific fields
    agencyName: {
      type: String,
      trim: true,
      required: function() {
        return this.role === 'agency';
      }
    },
    agencyLicense: {
      type: String,
      trim: true
    },
    agencyAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },

    // DSP-specific fields
    dateOfBirth: {
      type: Date
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    },
    availability: {
      type: Map,
      of: [String] // Map of day to array of available time slots
    },
    hourlyRate: {
      type: Number,
      min: 0
    },

    // Common fields for all roles
    profilePicture: {
      type: String // URL to profile picture
    },
    bio: {
      type: String,
      maxlength: 500
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
      },
      language: {
        type: String,
        default: 'en'
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ applicationStatus: 1 });
UserSchema.index({ appliedAgencies: 1 });
UserSchema.index({ approvedAgencies: 1 });
UserSchema.index({ 'complianceStatus.isComplete': 1 });
UserSchema.index({ isActive: 1 });

// Pre-save middleware for password hashing
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method for password comparison
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to apply to an agency
UserSchema.methods.applyToAgency = function(agencyId) {
  if (this.role !== 'dsp') {
    throw new Error('Only DSP users can apply to agencies');
  }

  if (!this.appliedAgencies.includes(agencyId)) {
    this.appliedAgencies.push(agencyId);
    this.applicationStatus = 'pending';
  }
  return this.save();
};

// Instance method to check if user is approved for an agency
UserSchema.methods.isApprovedForAgency = function(agencyId) {
  return this.approvedAgencies.includes(agencyId);
};

// Instance method to add application note
UserSchema.methods.addApplicationNote = function(agencyId, note, status) {
  this.applicationNotes.push({
    agency: agencyId,
    note: note,
    date: new Date(),
    status: status
  });
  return this.save();
};

// Static method to find DSPs by agency
UserSchema.statics.findDSPsByAgency = function(agencyId, status = null) {
  let query = { 
    role: 'dsp',
    appliedAgencies: agencyId
  };
  
  if (status) {
    query.applicationStatus = status;
  }
  
  return this.find(query)
    .select('first_name last_name email phone experience skills certifications applicationStatus createdAt')
    .sort({ createdAt: -1 });
};

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Virtual for isDSP (convenience method)
UserSchema.virtual('isDSP').get(function() {
  return this.role === 'dsp';
});

// Virtual for isAgency (convenience method)
UserSchema.virtual('isAgency').get(function() {
  return this.role === 'agency';
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("User", UserSchema);