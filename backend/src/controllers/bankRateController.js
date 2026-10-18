import mongoose from 'mongoose';
import { BankRate } from '../models/BankRate.js';
import { VERIFIED_BANK_RATES, LOAN_CATEGORIES } from '../data/bankRatesData.js';

export const MANDATORY_DISCLAIMER =
  "Interest rates shown are indicative and subject to change. Actual rates, eligibility and charges depend on the bank's current terms and the applicant's financial profile. Please verify the final offer directly with the bank.";

// In-memory clone for fallback / test environments without active MongoDB
let memoryBankRates = VERIFIED_BANK_RATES.map((rate, idx) => ({
  ...rate,
  _id: `mem_${rate.bankCode}_${rate.loanCategory}_${idx}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

// Normalizes query string loan category input (e.g., 'home-loans' -> 'home')
const normalizeCategory = (categoryInput) => {
  if (!categoryInput) return null;
  const cleaned = categoryInput.toLowerCase().trim().replace(/[-\s_]+/g, '');
  if (cleaned === 'all') return 'all';
  if (cleaned.startsWith('home')) return 'home';
  if (cleaned.startsWith('person')) return 'personal';
  if (cleaned.startsWith('car') || cleaned.startsWith('auto') || cleaned.startsWith('vehic')) return 'car';
  if (cleaned.startsWith('edu') || cleaned.startsWith('stud')) return 'education';
  if (cleaned.includes('two') || cleaned.includes('2') || cleaned.startsWith('bike') || cleaned.startsWith('scoot')) return 'two_wheeler';
  if (cleaned.startsWith('gold')) return 'gold';
  return categoryInput.toLowerCase().trim();
};

/**
 * Ensure database has initial verified rates seeded
 */
const ensureDbSeeded = async () => {
  if (mongoose.connection.readyState === 1) {
    const count = await BankRate.countDocuments();
    if (count === 0) {
      await BankRate.insertMany(VERIFIED_BANK_RATES);
    }
  }
};

/**
 * GET /api/bank-rates
 * Query params:
 *   - loanType / category: string (home, personal, car, education, two_wheeler, gold, all)
 *   - bank: string (bankCode or partial bankName)
 *   - bankType: string (Public Sector, Private Sector)
 *   - search: string (matches bankName, schemeName, notes)
 *   - sortBy: string ('minRate', 'maxRate', 'bankName', 'lastVerified')
 *   - sortOrder: string ('asc', 'desc')
 */
export const getBankRates = async (req, res, next) => {
  try {
    const rawCategory = req.query.loanType || req.query.loanCategory || req.query.category;
    const category = normalizeCategory(rawCategory);
    const bank = req.query.bank ? req.query.bank.trim() : null;
    const bankType = req.query.bankType ? req.query.bankType.trim() : null;
    const search = req.query.search ? req.query.search.trim() : null;
    const sortBy = req.query.sortBy || 'minRate';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    // Check MongoDB Connection
    if (mongoose.connection.readyState === 1) {
      await ensureDbSeeded();

      const query = {};

      if (category && category !== 'all') {
        query.loanCategory = category;
      }

      if (bankType) {
        query.bankType = bankType;
      }

      if (bank) {
        query.$or = [
          { bankCode: bank.toLowerCase() },
          { bankName: { $regex: bank, $options: 'i' } }
        ];
      }

      if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        const searchConditions = [
          { bankName: searchRegex },
          { schemeName: searchRegex },
          { loanCategoryName: searchRegex },
          { notes: searchRegex },
          { eligibility: searchRegex }
        ];

        if (query.$or) {
          query.$and = [
            { $or: query.$or },
            { $or: searchConditions }
          ];
          delete query.$or;
        } else {
          query.$or = searchConditions;
        }
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder;

      const rates = await BankRate.find(query).sort(sortOptions);

      return res.json({
        success: true,
        count: rates.length,
        disclaimer: MANDATORY_DISCLAIMER,
        data: rates
      });
    }

    // Fallback: In-memory store
    let filtered = [...memoryBankRates];

    if (category && category !== 'all') {
      filtered = filtered.filter((r) => r.loanCategory === category);
    }

    if (bankType) {
      filtered = filtered.filter((r) => r.bankType.toLowerCase() === bankType.toLowerCase());
    }

    if (bank) {
      const bLower = bank.toLowerCase();
      filtered = filtered.filter(
        (r) => r.bankCode.toLowerCase() === bLower || r.bankName.toLowerCase().includes(bLower)
      );
    }

    if (search) {
      const sLower = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.bankName.toLowerCase().includes(sLower) ||
          r.schemeName.toLowerCase().includes(sLower) ||
          r.loanCategoryName.toLowerCase().includes(sLower) ||
          (r.notes && r.notes.toLowerCase().includes(sLower)) ||
          (r.eligibility && r.eligibility.toLowerCase().includes(sLower))
      );
    }

    filtered.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortOrder === 1 ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = valA ?? 999;
      valB = valB ?? 999;
      return sortOrder === 1 ? valA - valB : valB - valA;
    });

    res.json({
      success: true,
      count: filtered.length,
      disclaimer: MANDATORY_DISCLAIMER,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bank-rates/categories
 * Returns list of supported categories with count of verified rates
 */
export const getCategories = async (req, res, next) => {
  try {
    let counts = {};

    if (mongoose.connection.readyState === 1) {
      await ensureDbSeeded();
      const agg = await BankRate.aggregate([
        { $group: { _id: '$loanCategory', count: { $sum: 1 } } }
      ]);
      agg.forEach((item) => {
        counts[item._id] = item.count;
      });
    } else {
      memoryBankRates.forEach((r) => {
        counts[r.loanCategory] = (counts[r.loanCategory] || 0) + 1;
      });
    }

    const categoriesWithCounts = LOAN_CATEGORIES.map((cat) => ({
      ...cat,
      rateCount: cat.id === 'all'
        ? Object.values(counts).reduce((sum, n) => sum + n, 0)
        : (counts[cat.id] || 0)
    }));

    res.json({
      success: true,
      categories: categoriesWithCounts,
      disclaimer: MANDATORY_DISCLAIMER
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bank-rates/:id
 */
export const getBankRateById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const rate = await BankRate.findById(id);
        if (rate) {
          return res.json({
            success: true,
            disclaimer: MANDATORY_DISCLAIMER,
            data: rate
          });
        }
      }
    }

    // In-memory fallback lookup
    const inMemRate = memoryBankRates.find(
      (r) => r._id === id || String(r._id) === String(id) || r.bankCode === id
    );

    if (!inMemRate) {
      return res.status(404).json({
        success: false,
        message: `Bank interest rate record not found for id: ${id}`,
        disclaimer: MANDATORY_DISCLAIMER
      });
    }

    res.json({
      success: true,
      disclaimer: MANDATORY_DISCLAIMER,
      data: inMemRate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bank-rates/seed
 * Controlled admin/maintenance endpoint to seed or refresh verified rates
 */
export const seedBankRates = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Clear existing verified rates and reload canonical verified dataset
      await BankRate.deleteMany({});
      const inserted = await BankRate.insertMany(VERIFIED_BANK_RATES);
      return res.json({
        success: true,
        message: 'Successfully seeded verified bank loan interest rates into MongoDB',
        count: inserted.length,
        disclaimer: MANDATORY_DISCLAIMER
      });
    }

    memoryBankRates = VERIFIED_BANK_RATES.map((rate, idx) => ({
      ...rate,
      _id: `mem_${rate.bankCode}_${rate.loanCategory}_${idx}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    res.json({
      success: true,
      message: 'Successfully seeded in-memory verified bank rates (MongoDB not connected)',
      count: memoryBankRates.length,
      disclaimer: MANDATORY_DISCLAIMER
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/bank-rates/:id
 * Controlled admin/manual process to update a rate once verified against official publications
 */
export const updateBankRate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      lastVerified: new Date()
    };

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const updated = await BankRate.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Bank rate record not found'
        });
      }

      return res.json({
        success: true,
        message: 'Bank interest rate updated successfully following official verification',
        data: updated,
        disclaimer: MANDATORY_DISCLAIMER
      });
    }

    // In-memory fallback
    const idx = memoryBankRates.findIndex((r) => r._id === id || String(r._id) === String(id));
    if (idx === -1) {
      return res.status(404).json({
        success: false,
        message: 'Bank rate record not found'
      });
    }

    memoryBankRates[idx] = {
      ...memoryBankRates[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Bank rate updated successfully (in-memory)',
      data: memoryBankRates[idx],
      disclaimer: MANDATORY_DISCLAIMER
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bank-rates
 * Add a new verified bank rate
 */
export const createBankRate = async (req, res, next) => {
  try {
    const rateData = {
      ...req.body,
      lastVerified: req.body.lastVerified ? new Date(req.body.lastVerified) : new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const newRate = await BankRate.create(rateData);
      return res.status(201).json({
        success: true,
        message: 'Verified bank rate created successfully',
        data: newRate,
        disclaimer: MANDATORY_DISCLAIMER
      });
    }

    const newRate = {
      ...rateData,
      _id: `mem_${rateData.bankCode || 'rate'}_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryBankRates.push(newRate);

    res.status(201).json({
      success: true,
      message: 'Verified bank rate created successfully (in-memory)',
      data: newRate,
      disclaimer: MANDATORY_DISCLAIMER
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bank-rates/banks
 * Returns distinct list of banks with supported categories and metadata
 */
export const getBankList = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await ensureDbSeeded();
      const banks = await BankRate.aggregate([
        {
          $group: {
            _id: '$bankCode',
            bankCode: { $first: '$bankCode' },
            bankName: { $first: '$bankName' },
            bankType: { $first: '$bankType' },
            sourceUrl: { $first: '$sourceUrl' },
            categories: { $addToSet: '$loanCategory' }
          }
        },
        { $sort: { bankName: 1 } }
      ]);
      return res.json({
        success: true,
        count: banks.length,
        disclaimer: MANDATORY_DISCLAIMER,
        data: banks
      });
    }

    // In-memory fallback
    const bankMap = new Map();
    memoryBankRates.forEach((r) => {
      if (!bankMap.has(r.bankCode)) {
        bankMap.set(r.bankCode, {
          bankCode: r.bankCode,
          bankName: r.bankName,
          bankType: r.bankType,
          sourceUrl: r.sourceUrl,
          categories: []
        });
      }
      bankMap.get(r.bankCode).categories.push(r.loanCategory);
    });

    const banks = Array.from(bankMap.values()).sort((a, b) =>
      a.bankName.localeCompare(b.bankName)
    );

    res.json({
      success: true,
      count: banks.length,
      disclaimer: MANDATORY_DISCLAIMER,
      data: banks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bank-rates/search
 * Search exact verified bank rate by Bank Name/Code and Loan Type.
 * Query params:
 *   - bank: string (e.g. 'SBI', 'HDFC Bank', 'sbi')
 *   - loanType: string (e.g. 'Car Loan', 'car', 'home', etc.)
 * Returns the actual rate for the selected bank and loan type only, without fallback.
 * If not offered or unverified, clearly indicates 'Rate not available'.
 */
export const searchBankRate = async (req, res, next) => {
  try {
    const rawBank = req.query.bank ? req.query.bank.trim() : null;
    const rawCategory = req.query.loanType || req.query.loanCategory || req.query.category;
    const category = normalizeCategory(rawCategory);

    if (!rawBank || !category) {
      return res.status(400).json({
        success: false,
        message: 'Both bank name and loan type (e.g. ?bank=SBI&loanType=car) are required.',
        disclaimer: MANDATORY_DISCLAIMER
      });
    }

    let match = null;

    if (mongoose.connection.readyState === 1) {
      await ensureDbSeeded();
      const bRegex = new RegExp(rawBank.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const bankQuery = {
        $and: [
          {
            $or: [
              { bankCode: rawBank.toLowerCase() },
              { bankName: bRegex }
            ]
          },
          { loanCategory: category }
        ]
      };

      match = await BankRate.findOne(bankQuery);
    } else {
      const bLower = rawBank.toLowerCase();
      match = memoryBankRates.find(
        (r) =>
          (r.bankCode.toLowerCase() === bLower ||
            r.bankName.toLowerCase() === bLower ||
            r.bankName.toLowerCase().includes(bLower)) &&
          r.loanCategory === category
      );
    }

    if (!match) {
      return res.json({
        success: true,
        found: false,
        status: 'Rate not available',
        message: `Rate not available or not officially verified for ${rawBank} under ${category} loans.`,
        bank: rawBank,
        loanCategory: category,
        data: null,
        disclaimer: MANDATORY_DISCLAIMER
      });
    }

    res.json({
      success: true,
      found: true,
      status: match.status || 'Verified',
      data: match,
      disclaimer: MANDATORY_DISCLAIMER
    });
  } catch (error) {
    next(error);
  }
};

