import mongoose from 'mongoose';

const loanScenarioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner userId is required']
    },
    name: {
      type: String,
      required: [true, 'Scenario name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    principal: {
      type: Number,
      required: [true, 'Principal amount is required'],
      min: [0, 'Principal amount cannot be negative']
    },
    annualRate: {
      type: Number,
      required: [true, 'Annual interest rate is required'],
      min: [0, 'Interest rate cannot be negative'],
      max: [100, 'Interest rate cannot exceed 100%']
    },
    tenureMonths: {
      type: Number,
      required: [true, 'Tenure in months is required'],
      min: [1, 'Tenure must be at least 1 month'],
      max: [600, 'Tenure cannot exceed 600 months']
    },
    tenureUnit: {
      type: String,
      enum: ['years', 'months'],
      default: 'years'
    },
    emi: {
      type: Number,
      default: 0
    },
    totalInterest: {
      type: Number,
      default: 0
    },
    totalPayment: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    tags: {
      type: [String],
      default: ['General']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index on userId and createdAt for fast scenario sorting per user
loanScenarioSchema.index({ userId: 1, createdAt: -1 });

export const LoanScenario = mongoose.models.LoanScenario || mongoose.model('LoanScenario', loanScenarioSchema);
export const SavedScenario = LoanScenario;
