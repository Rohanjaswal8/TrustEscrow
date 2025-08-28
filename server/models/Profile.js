const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  wallet: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    default: 'Anonymous'
  },
  email: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  telegram: {
    type: String,
    default: ''
  },
  preferredCurrency: {
    type: String,
    default: 'ETH'
  },
  settings: {
    darkMode: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    blockedUsers: [{
      type: String,
      lowercase: true
    }],
    language: {
      type: String,
      default: 'en'
    }
  },
  securitySettings: {
    requirePasswordForTransactions: {
      type: Boolean,
      default: true
    },
    enableLoginNotifications: {
      type: Boolean,
      default: true
    },
    lastPasswordChange: {
      type: Date,
      default: Date.now
    },
    backupEmail: {
      type: String,
      default: ''
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
profileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Profile', profileSchema);