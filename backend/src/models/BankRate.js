import mongoose from 'mongoose';

const bankRateSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
      index: true
    },
    bankCode: {
      type: String,
      required: [true, 'Bank code is required'],
      lowercase: true,
      trim: true,
      index: true
    },
    bankType: {
      type: String,
      enum: ['Public Sector', 'Private Sector', 'Foreign Bank', 'Small Finance Bank'],
      default: 'Public Sector'
    },
    loanCategory: {
      type: String,
      required: [true, 'Loan category is required'],
      enum: ['home', 'personal', 'car', 'education', 'two_wheeler', 'gold'],
      lowercase: true,
      trim: true,
      index: true
    },
    loanCategoryName: {
      type: String,
      required: [true, 'Category display name is required']
    },
    schemeName: {
      type: String,
      required: [true, 'Loan scheme name is required'],
      trim: true
    },
    minRate: {
      type: Number,
      min: [0, 'Interest rate cannot be negative'],
      max: [100, 'Interest rate cannot exceed 100%']
    },
    maxRate: {
      type: Number,
      min: [0, 'Interest rate cannot be negative'],
      max: [100, 'Interest rate cannot exceed 100%']
    },
    rateType: {
      type: String,
      enum: ['Floating', 'Fixed', 'Floating / Fixed', 'EBLR Linked', 'RLLR Linked', 'MCLR Linked', 'BRLLR Linked', 'RBLR Linked'],
      default: 'Floating'
    },
    benchmark: {
      type: String,
      default: ''
    },
    conditions: {
      type: [String],
      default: []
    },
    eligibility: {
      type: String,
      default: ''
    },
    processingFee: {
      type: String,
      default: 'Contact bank for applicable charges'
    },
    sourceUrl: {
      type: String,
      required: [true, 'Official bank source URL is required'],
      trim: true
    },
    lastVerified: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Verified', 'Rate not verified', 'Rate not available'],
      default: 'Verified'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for fast multi-dimensional queries
bankRateSchema.index({ loanCategory: 1, minRate: 1 });
bankRateSchema.index({ bankCode: 1, loanCategory: 1 });

export const BankRate = mongoose.models.BankRate || mongoose.model('BankRate', bankRateSchema);
