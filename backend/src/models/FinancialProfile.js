import mongoose from 'mongoose';

const existingLoanSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => `emi_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    },
    name: {
      type: String,
      required: [true, 'Loan name is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Monthly EMI amount is required'],
      min: [0, 'EMI amount cannot be negative']
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Outstanding balance cannot be negative']
    },
    annualRate: {
      type: Number,
      default: 10,
      min: [0, 'Interest rate cannot be negative'],
      max: [100, 'Interest rate cannot exceed 100%']
    },
    remainingMonths: {
      type: Number,
      default: 12,
      min: [1, 'Remaining tenure must be at least 1 month']
    }
  },
  { _id: false }
);

const financialProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    monthlyIncome: {
      type: Number,
      required: [true, 'Monthly income is required'],
      min: [0, 'Monthly income cannot be negative']
    },
    monthlyExpenses: {
      type: Number,
      required: [true, 'Monthly living expenses are required'],
      min: [0, 'Living expenses cannot be negative']
    },
    otherExpenses: {
      type: Number,
      default: 0,
      min: [0, 'Other expenses cannot be negative']
    },
    monthlySavingsTarget: {
      type: Number,
      default: 0,
      min: [0, 'Monthly savings target cannot be negative']
    },
    currentSavings: {
      type: Number,
      default: 0,
      min: [0, 'Current savings cannot be negative']
    },
    existingEmis: {
      type: [existingLoanSchema],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for total baseline living + other expenses (avoids double counting)
financialProfileSchema.virtual('totalLivingAndOtherExpenses').get(function () {
  return (this.monthlyExpenses || 0) + (this.otherExpenses || 0);
});

// Virtual for sum of all existing loan monthly payments
financialProfileSchema.virtual('totalExistingEmisAmount').get(function () {
  if (!this.existingEmis || !Array.isArray(this.existingEmis)) return 0;
  return this.existingEmis.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
});

export const FinancialProfile = mongoose.models.FinancialProfile || mongoose.model('FinancialProfile', financialProfileSchema);
