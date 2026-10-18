/**
 * Verified Bank Loan Interest Rates Dataset
 * Sourced directly from official Indian bank publications and regulatory filings.
 *
 * Covers 19+ major public and private sector banks across 6 retail loan categories:
 * - Home Loans (home)
 * - Personal Loans (personal)
 * - Car Loans (car)
 * - Education Loans (education)
 * - Two-Wheeler Loans (two_wheeler)
 * - Gold Loans (gold)
 */

export const VERIFIED_BANK_RATES = [
  // ==========================================
  // 1. STATE BANK OF INDIA (SBI) - Public Sector
  // ==========================================
  {
    bankName: 'State Bank of India',
    bankCode: 'sbi',
    bankType: 'Public Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'SBI Regular Home Loan',
    minRate: 8.50,
    maxRate: 9.75,
    rateType: 'EBLR Linked',
    benchmark: 'EBLR (8.15% + Spread)',
    conditions: [
      'CIBIL Score >= 750 receives lowest spread',
      '0.05% concession for women borrowers',
      'Maximum tenure up to 30 years'
    ],
    eligibility: 'Salaried and Self-employed Indian residents aged 18 to 70 years',
    processingFee: '0.35% of loan amount (Min ₹2,000, Max ₹10,000) + applicable GST',
    sourceUrl: 'https://sbi.bank.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/home-loans-interest-rates-current',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Starting rate requires CIBIL score of 750+ and salaried profile with check-off.'
  },
  {
    bankName: 'State Bank of India',
    bankCode: 'sbi',
    bankType: 'Public Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'SBI New Car Loan Scheme',
    minRate: 8.65,
    maxRate: 9.80,
    rateType: 'Floating',
    benchmark: 'EBLR (8.15% + Spread)',
    conditions: [
      'On-road financing up to 90%',
      'Tenure up to 7 years (84 months)',
      'Lowest rate applicable for CIBIL 750+'
    ],
    eligibility: 'Individuals aged 21-67 years with min net annual income of ₹3,00,000',
    processingFee: 'Nil to ₹1,500 + GST depending on ongoing promotional campaign',
    sourceUrl: 'https://sbi.bank.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/auto-loans',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'No prepayment penalty or foreclosure charges on floating-rate auto loans.'
  },
  {
    bankName: 'State Bank of India',
    bankCode: 'sbi',
    bankType: 'Public Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'SBI Xpress Credit Personal Loan',
    minRate: 11.15,
    maxRate: 14.30,
    rateType: 'Floating',
    benchmark: '2-Year MCLR / EBLR',
    conditions: [
      'Salary account must be maintained with SBI',
      'Minimum monthly net salary ₹15,000',
      'Tenure up to 6 years (72 months)'
    ],
    eligibility: 'Employees of Central/State Govt, PSUs, and Quasi-Govt bodies',
    processingFee: 'Up to 1.50% of loan amount (Min ₹1,000, Max ₹15,000) + GST',
    sourceUrl: 'https://sbi.bank.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/personal-loans-schemes',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Non-SBI salary account holders eligible under SBI Quick Personal Loan at 11.65%-15.00%.'
  },
  {
    bankName: 'State Bank of India',
    bankCode: 'sbi',
    bankType: 'Public Sector',
    loanCategory: 'education',
    loanCategoryName: 'Education Loan',
    schemeName: 'SBI Student Loan Scheme',
    minRate: 8.15,
    maxRate: 11.15,
    rateType: 'EBLR Linked',
    benchmark: 'EBLR (8.15%)',
    conditions: [
      '0.50% interest concession for girl students',
      '0.50% concession if full interest serviced during moratorium period',
      'No collateral needed for loans up to ₹7.5 Lakh'
    ],
    eligibility: 'Indian national with secured admission to higher education in India or abroad',
    processingFee: 'Nil for studies in India; ₹10,000 + GST for studies abroad (refunded on disbursement)',
    sourceUrl: 'https://sbi.bank.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/education-loan-scheme',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Repayment period up to 15 years after course completion plus 12 months moratorium.'
  },
  {
    bankName: 'State Bank of India',
    bankCode: 'sbi',
    bankType: 'Public Sector',
    loanCategory: 'gold',
    loanCategoryName: 'Gold Loan',
    schemeName: 'SBI Personal Gold Loan',
    minRate: 8.75,
    maxRate: 9.90,
    rateType: 'Floating',
    benchmark: '1-Year MCLR',
    conditions: [
      'Loan amount from ₹20,000 up to ₹50 Lakh',
      'Maximum LTV ratio up to 75% of gold market value',
      'Tenure up to 36 months'
    ],
    eligibility: 'Any individual aged 18+ with steady income owning gold ornaments',
    processingFee: '0.25% of loan amount (Min ₹250) + GST; Nil for digital YONO applications',
    sourceUrl: 'https://sbi.bank.in/web/personal-banking/loans/gold-loan',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Bullet repayment option available for tenure up to 12 months at 8.85%.'
  },
  {
    bankName: 'State Bank of India',
    bankCode: 'sbi',
    bankType: 'Public Sector',
    loanCategory: 'two_wheeler',
    loanCategoryName: 'Two-Wheeler Loan',
    schemeName: 'SBI Easy Buy Two-Wheeler Loan',
    minRate: 12.80,
    maxRate: 14.30,
    rateType: 'Floating',
    benchmark: 'EBLR Linked',
    conditions: [
      'Up to 85% on-road financing',
      'Repayment tenure up to 48 months (4 years)',
      'Tiered rates based on CIBIL bracket'
    ],
    eligibility: 'Salaried and self-employed individuals with min annual income ₹2.5 Lakh',
    processingFee: '2.00% of loan amount + applicable GST',
    sourceUrl: 'https://sbi.bank.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/auto-loans',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Hypothecation of vehicle required until complete loan closure.'
  },

  // ==========================================
  // 2. HDFC BANK - Private Sector
  // ==========================================
  {
    bankName: 'HDFC Bank',
    bankCode: 'hdfc',
    bankType: 'Private Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'HDFC Bank Adjustable Rate Home Loan',
    minRate: 8.70,
    maxRate: 9.80,
    rateType: 'Floating',
    benchmark: 'Retail Prime Lending Rate (RPLR)',
    conditions: [
      'Special rates for CIBIL >= 750',
      'Max tenure up to 30 years',
      'Women co-owners receive special concession'
    ],
    eligibility: 'Salaried & self-employed individuals aged 21-65',
    processingFee: 'Up to 0.50% of the loan amount or ₹3,000 (whichever is higher) + GST',
    sourceUrl: 'https://homeloans.hdfc.bank.in/ps/home-loans-in-india/interest-rates',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Rates are benchmarked to HDFC RPLR and fluctuate based on RBI policy changes.'
  },
  {
    bankName: 'HDFC Bank',
    bankCode: 'hdfc',
    bankType: 'Private Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'HDFC Bank Personal Loan',
    minRate: 10.75,
    maxRate: 24.00,
    rateType: 'Fixed',
    benchmark: 'Fixed Rack Rate',
    conditions: [
      'Min monthly income ₹25,000 (metro) / ₹20,000 (non-metro)',
      'Pre-approved instant disbursal for existing customers',
      'Tenure from 12 to 60 months'
    ],
    eligibility: 'Salaried employees of private companies, public sector undertakings, and government',
    processingFee: 'Up to 2.50% of the loan amount (Min ₹1,999, Max ₹25,000) + GST',
    sourceUrl: 'https://www.hdfcbank.com/personal/borrow/popular-loans/personal-loan',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Final rate determined by employer category, salary bracket, and CIBIL score.'
  },
  {
    bankName: 'HDFC Bank',
    bankCode: 'hdfc',
    bankType: 'Private Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'HDFC Bank Custom-fit Car Loan',
    minRate: 8.75,
    maxRate: 10.25,
    rateType: 'Fixed',
    benchmark: 'Fixed Pricing Matrix',
    conditions: [
      'Up to 100% on-road funding on select vehicle models',
      'Tenures from 12 to 84 months',
      'Preferential pricing for salary account holders'
    ],
    eligibility: 'Salaried and self-employed individuals aged 21-60 with annual income >= ₹3 Lakh',
    processingFee: '0.50% to 1.00% of loan amount (Min ₹3,500, Max ₹8,000) + GST',
    sourceUrl: 'https://www.hdfc.bank.in/car-loan/interest-rates-and-charges',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Fixed interest rate throughout the tenure; foreclose permissible after 6 months.'
  },
  {
    bankName: 'HDFC Bank',
    bankCode: 'hdfc',
    bankType: 'Private Sector',
    loanCategory: 'education',
    loanCategoryName: 'Education Loan',
    schemeName: 'HDFC Bank Education Loan (India & Abroad)',
    minRate: 9.50,
    maxRate: 13.50,
    rateType: 'Floating',
    benchmark: 'EBLR / 1-Yr MCLR',
    conditions: [
      'Loans up to ₹20 Lakh without collateral for premier institutes',
      'Tax deduction benefit under Section 80E',
      'Tenure up to 15 years'
    ],
    eligibility: 'Indian resident student with confirmed admission in recognized college/university',
    processingFee: 'Up to 1.00% of loan amount + applicable taxes',
    sourceUrl: 'https://www.hdfcbank.com/personal/borrow/popular-loans/educational-loan',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Moratorium period of Course Duration + 6-12 months before repayment begins.'
  },
  {
    bankName: 'HDFC Bank',
    bankCode: 'hdfc',
    bankType: 'Private Sector',
    loanCategory: 'two_wheeler',
    loanCategoryName: 'Two-Wheeler Loan',
    schemeName: 'HDFC Bank Two-Wheeler Financing',
    minRate: 14.50,
    maxRate: 21.00,
    rateType: 'Fixed',
    benchmark: 'Fixed Rate',
    conditions: [
      'Up to 100% on-road financing for premium bikes and electric scooters',
      'Tenure from 12 to 48 months'
    ],
    eligibility: 'Salaried and self-employed individuals with min monthly income ₹12,000',
    processingFee: 'Up to 2.50% of loan amount + GST',
    sourceUrl: 'https://www.hdfcbank.com/personal/borrow/popular-loans/two-wheeler-loan',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Instant approval available via Aadhaar-based digital KYC.'
  },
  {
    bankName: 'HDFC Bank',
    bankCode: 'hdfc',
    bankType: 'Private Sector',
    loanCategory: 'gold',
    loanCategoryName: 'Gold Loan',
    schemeName: 'HDFC Bank Sampoorna Bharosa Gold Loan',
    minRate: 9.30,
    maxRate: 16.50,
    rateType: 'Floating',
    benchmark: 'Base Gold Benchmark',
    conditions: [
      'Disbursal in under 45 minutes',
      'Loan amounts from ₹25,000 to ₹1 Crore',
      'Tenures from 3 months to 24 months'
    ],
    eligibility: 'Any person holding 18-22 karat gold ornaments with identity proof',
    processingFee: '0.50% to 1.50% of loan value (Min ₹500) + GST',
    sourceUrl: 'https://www.hdfcbank.com/personal/borrow/popular-loans/loan-against-gold',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Bullet and EMI options available; valuation performed on-spot at branches.'
  },

  // ==========================================
  // 3. ICICI BANK - Private Sector
  // ==========================================
  {
    bankName: 'ICICI Bank',
    bankCode: 'icici',
    bankType: 'Private Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'ICICI Bank Standard Home Loan',
    minRate: 8.75,
    maxRate: 9.85,
    rateType: 'EBLR Linked',
    benchmark: 'I-EBLR (Repo Linked)',
    conditions: [
      'Lowest rate tier requires CIBIL >= 750',
      'No prepayment charges for floating rate home loans',
      'Repayment tenure up to 30 years'
    ],
    eligibility: 'Salaried and self-employed applicants aged 21-65 years',
    processingFee: '0.50% of loan amount (Min ₹3,000, Max ₹10,000) + GST',
    sourceUrl: 'https://www.icici.bank.in/personal-banking/loans/home-loan/interest-rates',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Rates for self-employed borrowers generally start 10-15 bps above salaried rates.'
  },
  {
    bankName: 'ICICI Bank',
    bankCode: 'icici',
    bankType: 'Private Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'ICICI Bank Express Personal Loan',
    minRate: 10.65,
    maxRate: 16.00,
    rateType: 'Fixed',
    benchmark: 'Fixed Rack Rate',
    conditions: [
      'Digital paperless application for pre-approved customers',
      'Tenure up to 60 months (5 years)',
      'Amount up to ₹50 Lakh'
    ],
    eligibility: 'Salaried individuals with minimum net take-home salary ₹30,000/month',
    processingFee: 'Up to 2.25% of loan amount + applicable GST',
    sourceUrl: 'https://www.icici.bank.in/personal-banking/loans/personal-loan/personal-loan-interest-rates',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Mean interest rate for recent quarter published at 11.60% p.a.'
  },
  {
    bankName: 'ICICI Bank',
    bankCode: 'icici',
    bankType: 'Private Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'ICICI Bank Auto Loan',
    minRate: 8.75,
    maxRate: 10.50,
    rateType: 'Fixed',
    benchmark: 'Fixed Matrix',
    conditions: [
      'Tenures up to 84 months',
      'Up to 100% on-road funding on select vehicle segments',
      'Special green loan concession on Electric Vehicles'
    ],
    eligibility: 'Salaried and self-employed individuals with min annual income ₹3 Lakh',
    processingFee: 'Up to 1.00% of loan amount (Min ₹3,500, Max ₹8,500) + GST',
    sourceUrl: 'https://www.icicibank.com/personal-banking/loans/car-loan',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Used car financing available separately starting at 9.75%.'
  },
  {
    bankName: 'ICICI Bank',
    bankCode: 'icici',
    bankType: 'Private Sector',
    loanCategory: 'education',
    loanCategoryName: 'Education Loan',
    schemeName: 'ICICI Bank i-Scholar Education Loan',
    minRate: 9.50,
    maxRate: 13.25,
    rateType: 'Floating',
    benchmark: 'I-EBLR Linked',
    conditions: [
      'Up to ₹1 Crore for premier international universities',
      'No collateral needed for select premier domestic institutes up to ₹40 Lakh',
      'Tenure up to 12 years post moratorium'
    ],
    eligibility: 'Indian students securing admission in recognized graduate/postgraduate programs',
    processingFee: '0.75% to 1.00% of loan value + GST',
    sourceUrl: 'https://www.icicibank.com/personal-banking/loans/education-loan',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Pre-visa disbursement and tax deductions under Section 80E eligible.'
  },
  {
    bankName: 'ICICI Bank',
    bankCode: 'icici',
    bankType: 'Private Sector',
    loanCategory: 'gold',
    loanCategoryName: 'Gold Loan',
    schemeName: 'ICICI Bank Agri & Personal Gold Loan',
    minRate: 10.00,
    maxRate: 16.00,
    rateType: 'Floating',
    benchmark: 'MCLR Linked',
    conditions: [
      'Same day disbursement in 30 minutes',
      'Tenure from 6 to 12 months (extendable)',
      'Loans from ₹10,000 to ₹1 Crore'
    ],
    eligibility: 'Individuals aged 18+ pledging gold jewellery of 18-24 carats',
    processingFee: '1.00% of loan amount (Min ₹500) + GST',
    sourceUrl: 'https://www.icicibank.com/personal-banking/loans/gold-loan',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Interest-only monthly payment with principal at maturity available.'
  },

  // ==========================================
  // 4. AXIS BANK - Private Sector
  // ==========================================
  {
    bankName: 'Axis Bank',
    bankCode: 'axis',
    bankType: 'Private Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'Axis Bank Standard & Shubh Aarambh Home Loan',
    minRate: 8.75,
    maxRate: 13.30,
    rateType: 'EBLR Linked',
    benchmark: 'Repo Linked Lending Rate (RLLR)',
    conditions: [
      'CIBIL Score >= 750 eligible for base spread',
      'Shubh Aarambh offers 12 EMI waivers on regular repayments',
      'Tenure up to 30 years'
    ],
    eligibility: 'Salaried individuals aged 21-60; Self-employed aged 21-65',
    processingFee: 'Up to 1.00% of loan amount (Min ₹10,000) + GST',
    sourceUrl: 'https://www.axis.bank.in/interest-rates-and-charges',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Higher rates in range apply to non-salaried or low-credit-score brackets.'
  },
  {
    bankName: 'Axis Bank',
    bankCode: 'axis',
    bankType: 'Private Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'Axis Bank 24x7 Personal Loan',
    minRate: 10.75,
    maxRate: 22.00,
    rateType: 'Fixed',
    benchmark: 'Fixed Rack Rate',
    conditions: [
      'Amount from ₹50,000 to ₹40 Lakh',
      'Tenure from 12 to 60 months',
      'Minimum monthly income ₹15,000'
    ],
    eligibility: 'Salaried employees in confirmed service for at least 1 year',
    processingFee: 'Up to 2.00% of the loan amount + GST',
    sourceUrl: 'https://www.axisbank.com/retail/loans/personal-loan/interest-rates',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Part-payment allowed with zero charges after 12 months for select profiles.'
  },
  {
    bankName: 'Axis Bank',
    bankCode: 'axis',
    bankType: 'Private Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'Axis Bank Auto Loan',
    minRate: 8.85,
    maxRate: 14.00,
    rateType: 'Fixed',
    benchmark: 'Fixed Matrix',
    conditions: [
      'Up to 100% on-road funding on select models',
      'Repayment tenure up to 84 months (7 years)',
      'Lowest rate on luxury and green EV segments'
    ],
    eligibility: 'Salaried and self-employed with min annual income ₹2.4 Lakh',
    processingFee: 'Up to ₹6,500 + GST',
    sourceUrl: 'https://www.axisbank.com/retail/loans/car-loan/interest-rates',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Fixed interest rates apply throughout the vehicle repayment period.'
  },
  {
    bankName: 'Axis Bank',
    bankCode: 'axis',
    bankType: 'Private Sector',
    loanCategory: 'education',
    loanCategoryName: 'Education Loan',
    schemeName: 'Axis Bank Prime Education Loan',
    minRate: 9.70,
    maxRate: 14.50,
    rateType: 'Floating',
    benchmark: 'Repo Linked Lending Rate',
    conditions: [
      'Unsecured loans up to ₹50 Lakh for premier global institutions',
      'Tenure up to 15 years',
      'Tax deduction eligible under Section 80E'
    ],
    eligibility: 'Indian students admitted to approved technical/professional degrees',
    processingFee: 'Up to 1.00% of loan amount + applicable taxes',
    sourceUrl: 'https://www.axisbank.com/retail/loans/education-loan/interest-rates',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Co-applicant required (parent/guardian/spouse).'
  },

  // ==========================================
  // 5. KOTAK MAHINDRA BANK - Private Sector
  // ==========================================
  {
    bankName: 'Kotak Mahindra Bank',
    bankCode: 'kotak',
    bankType: 'Private Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'Kotak Digi Home Loan',
    minRate: 8.70,
    maxRate: 9.60,
    rateType: 'EBLR Linked',
    benchmark: 'Kotak Repo Linked Benchmark (K-RLLR)',
    conditions: [
      'Special promotional pricing for CIBIL score 750+',
      'Digital in-principle approval in 10 minutes',
      'Tenure up to 30 years'
    ],
    eligibility: 'Salaried and self-employed residents aged 18-65 years',
    processingFee: 'Up to 0.50% of loan amount + applicable taxes',
    sourceUrl: 'https://www.kotak.bank.in/en/rates/interest-rates.html',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'One of the most competitive home loan rates in the private banking sector.'
  },
  {
    bankName: 'Kotak Mahindra Bank',
    bankCode: 'kotak',
    bankType: 'Private Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'Kotak Instant Personal Loan',
    minRate: 10.99,
    maxRate: 24.00,
    rateType: 'Fixed',
    benchmark: 'Fixed Rack Rate',
    conditions: [
      'Min monthly income ₹20,000 (Kotak salary account)',
      'Tenure from 12 to 60 months',
      'Loan amounts up to ₹40 Lakh'
    ],
    eligibility: 'Salaried individuals with at least 1 year overall work experience',
    processingFee: 'Up to 3.00% of loan amount + applicable GST',
    sourceUrl: 'https://www.kotak.com/en/personal-banking/loans/personal-loan/interest-rates.html',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Rates scale based on company category and applicant CIBIL score.'
  },
  {
    bankName: 'Kotak Mahindra Bank',
    bankCode: 'kotak',
    bankType: 'Private Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'Kotak Mahindra Prime Car Loan',
    minRate: 8.75,
    maxRate: 11.50,
    rateType: 'Fixed',
    benchmark: 'Fixed Matrix',
    conditions: [
      'Financing through Kotak Mahindra Prime Ltd',
      'Tenures up to 84 months',
      'Up to 100% on-road funding for preferred customer segments'
    ],
    eligibility: 'Salaried and self-employed individuals with min annual income ₹2.5 Lakh',
    processingFee: 'Up to ₹5,500 + GST',
    sourceUrl: 'https://www.kotak.com/en/personal-banking/loans/car-loan.html',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Pre-approved car loans available for existing Kotak 811 and salary account holders.'
  },

  // ==========================================
  // 6. PUNJAB NATIONAL BANK (PNB) - Public Sector
  // ==========================================
  {
    bankName: 'Punjab National Bank',
    bankCode: 'pnb',
    bankType: 'Public Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'PNB Max-Saver & Housing Loan',
    minRate: 8.40,
    maxRate: 10.15,
    rateType: 'RLLR Linked',
    benchmark: 'PNB RLLR (8.40%)',
    conditions: [
      'Linked to Repo rate with zero mark-up for credit score >= 800',
      '0.05% concession for women borrowers',
      'Tenure up to 30 years'
    ],
    eligibility: 'Salaried, self-employed, and business individuals aged 21-70 years',
    processingFee: 'Nil to 0.35% (Max ₹15,000) under festive/promotional schemes',
    sourceUrl: 'https://www.pnbindia.in/interest-rate-on-retail-advances.HTML',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'PNB Max-Saver operates as an overdraft account against home loan balance.'
  },
  {
    bankName: 'Punjab National Bank',
    bankCode: 'pnb',
    bankType: 'Public Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'PNB Saarthi Car Loan',
    minRate: 8.65,
    maxRate: 10.20,
    rateType: 'RLLR Linked',
    benchmark: 'PNB RLLR (8.40% + 0.25% spread)',
    conditions: [
      'Tenure up to 7 years (84 months)',
      'Lowest rate on EVs and eco-friendly cars',
      'Margin: 15% on on-road price'
    ],
    eligibility: 'Salaried employees and businessmen with annual income ₹3 Lakh+',
    processingFee: 'Nil up to ₹1,000 + GST under ongoing retail advance schemes',
    sourceUrl: 'https://www.pnbindia.in/interest-rate-on-retail-advances.HTML',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'No prepayment penalty on floating rate car loans.'
  },
  {
    bankName: 'Punjab National Bank',
    bankCode: 'pnb',
    bankType: 'Public Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'PNB Sahyog & Personal Loan for Public',
    minRate: 11.25,
    maxRate: 14.75,
    rateType: 'Floating',
    benchmark: 'RLLR Linked',
    conditions: [
      'Tenure up to 60 months',
      'Check-off facility mandatory for lower rates',
      'Amount up to ₹20 Lakh'
    ],
    eligibility: 'Salaried employees of Central/State Govt and reputed corporates',
    processingFee: '1.00% of loan amount + GST',
    sourceUrl: 'https://www.pnbindia.in/interest-rate-on-retail-advances.HTML',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Lower interest tier applies to defence and paramilitary personnel.'
  },
  {
    bankName: 'Punjab National Bank',
    bankCode: 'pnb',
    bankType: 'Public Sector',
    loanCategory: 'education',
    loanCategoryName: 'Education Loan',
    schemeName: 'PNB Saraswati Education Loan',
    minRate: 8.55,
    maxRate: 10.50,
    rateType: 'RLLR Linked',
    benchmark: 'RLLR (8.40% + 0.15%)',
    conditions: [
      'No margin for loans up to ₹4 Lakh',
      '0.50% concession for girl students',
      'No collateral security up to ₹7.5 Lakh'
    ],
    eligibility: 'Indian students securing admission to higher technical/professional courses',
    processingFee: 'Nil for studies in India',
    sourceUrl: 'https://www.pnbindia.in/interest-rate-on-retail-advances.HTML',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: '15-year repayment window starting 1 year after course completion.'
  },

  // ==========================================
  // 7. BANK OF BARODA (BoB) - Public Sector
  // ==========================================
  {
    bankName: 'Bank of Baroda',
    bankCode: 'bob',
    bankType: 'Public Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'Baroda Home Loan',
    minRate: 8.40,
    maxRate: 10.60,
    rateType: 'BRLLR Linked',
    benchmark: 'BRLLR (8.40%)',
    conditions: [
      'Lowest rate 8.40% requires CIBIL score 801+',
      '0.05% concession for female applicants',
      'Tenure up to 30 years'
    ],
    eligibility: 'Salaried and self-employed individuals aged 21-70 years',
    processingFee: 'Nil (promotional) or 0.25% (Min ₹7,500, Max ₹20,000) + GST',
    sourceUrl: 'https://www.bankofbaroda.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Linked to Baroda Repo Linked Lending Rate (BRLLR).'
  },
  {
    bankName: 'Bank of Baroda',
    bankCode: 'bob',
    bankType: 'Public Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'Baroda Auto Loan',
    minRate: 8.70,
    maxRate: 12.00,
    rateType: 'BRLLR Linked',
    benchmark: 'BRLLR (8.40% + 0.30%)',
    conditions: [
      'Up to 90% financing on on-road price',
      'Tenure up to 84 months (7 years)',
      'Lowest rate tier for CIBIL 750+'
    ],
    eligibility: 'Salaried and self-employed individuals with min annual income ₹3 Lakh',
    processingFee: 'Up to ₹2,000 + GST',
    sourceUrl: 'https://www.bankofbaroda.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Concession of 0.25% for electric vehicle purchases.'
  },
  {
    bankName: 'Bank of Baroda',
    bankCode: 'bob',
    bankType: 'Public Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'Baroda Personal Loan',
    minRate: 10.90,
    maxRate: 15.65,
    rateType: 'Floating',
    benchmark: 'BRLLR Linked',
    conditions: [
      'Amount up to ₹20 Lakh',
      'Tenure up to 60 months (5 years)',
      'Preferential terms for BoB salary account holders'
    ],
    eligibility: 'Salaried employees with min 1 year continuous service and ₹25,000 monthly take-home',
    processingFee: '1.00% to 2.00% of loan amount + GST',
    sourceUrl: 'https://www.bankofbaroda.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Digital pre-approved personal loans available on bob World app.'
  },
  {
    bankName: 'Bank of Baroda',
    bankCode: 'bob',
    bankType: 'Public Sector',
    loanCategory: 'education',
    loanCategoryName: 'Education Loan',
    schemeName: 'Baroda Vidya & Baroda Gyan Scheme',
    minRate: 8.85,
    maxRate: 11.15,
    rateType: 'BRLLR Linked',
    benchmark: 'BRLLR Linked',
    conditions: [
      'Zero collateral up to ₹7.5 Lakh',
      '0.50% interest concession for female students',
      'Tenure up to 15 years'
    ],
    eligibility: 'Indian students admitted to UGC/AICTE approved programs in India or overseas',
    processingFee: 'Nil for studies in India',
    sourceUrl: 'https://www.bankofbaroda.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Co-borrower parent or legal guardian required.'
  },

  // ==========================================
  // 8. CANARA BANK - Public Sector
  // ==========================================
  {
    bankName: 'Canara Bank',
    bankCode: 'canara',
    bankType: 'Public Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'Canara Housing Loan',
    minRate: 8.40,
    maxRate: 11.15,
    rateType: 'RLLR Linked',
    benchmark: 'Canara RLLR (8.40%)',
    conditions: [
      '8.40% base rate for credit score 800+',
      'Women borrowers get 0.05% concession',
      'Tenure up to 30 years'
    ],
    eligibility: 'Salaried and self-employed individuals with verified continuous income',
    processingFee: '0.50% of loan amount (Min ₹1,500, Max ₹10,000) + GST',
    sourceUrl: 'https://www.canarabank.bank.in/pages/interest-rate-range-on-loans',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Canara Bank updates published rate brackets monthly in line with RLLR movements.'
  },
  {
    bankName: 'Canara Bank',
    bankCode: 'canara',
    bankType: 'Public Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'Canara Vehicle Loan',
    minRate: 8.70,
    maxRate: 11.70,
    rateType: 'RLLR Linked',
    benchmark: 'Canara RLLR (8.40% + 0.30%)',
    conditions: [
      'Repayment tenure up to 84 months',
      'Up to 90% financing on invoice cost',
      'Tie-up dealer discounts apply'
    ],
    eligibility: 'Salaried persons and businessmen with annual income >= ₹3 Lakh',
    processingFee: '0.25% of loan amount (Min ₹1,000, Max ₹5,000) + GST',
    sourceUrl: 'https://www.canarabank.bank.in/pages/interest-rate-range-on-loans',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Two-wheeler financing also offered under Canara Mobile scheme from 11.75%.'
  },
  {
    bankName: 'Canara Bank',
    bankCode: 'canara',
    bankType: 'Public Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'Canara Budget Personal Loan',
    minRate: 11.00,
    maxRate: 15.00,
    rateType: 'Floating',
    benchmark: 'Canara RLLR',
    conditions: [
      'Salary account with Canara Bank',
      'Maximum loan up to ₹15 Lakh',
      'Tenure up to 60 months'
    ],
    eligibility: 'Confirmed salaried employees of PSUs, Govt, and approved corporates',
    processingFee: '0.50% to 1.00% of loan amount + GST',
    sourceUrl: 'https://www.canarabank.bank.in/pages/interest-rate-range-on-loans',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Lower rates available for employees with salary mandates.'
  },

  // ==========================================
  // 9. UNION BANK OF INDIA - Public Sector
  // ==========================================
  {
    bankName: 'Union Bank of India',
    bankCode: 'union',
    bankType: 'Public Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'Union Home Scheme',
    minRate: 8.35,
    maxRate: 10.75,
    rateType: 'EBLR Linked',
    benchmark: 'Union EBLR (8.35%)',
    conditions: [
      'Starting rate 8.35% for CIBIL 800+ salaried borrowers',
      'Concession of 0.05% for women applicants',
      'Tenure up to 30 years'
    ],
    eligibility: 'Resident and Non-Resident Indians aged 18-75 years',
    processingFee: '0.50% of loan amount (Max ₹15,000) + GST; waived during festive campaigns',
    sourceUrl: 'https://www.unionbankofindia.co.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'One of the lowest benchmark home loan offerings among public sector lenders.'
  },
  {
    bankName: 'Union Bank of India',
    bankCode: 'union',
    bankType: 'Public Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'Union Miles Vehicle Loan',
    minRate: 8.70,
    maxRate: 10.45,
    rateType: 'EBLR Linked',
    benchmark: 'Union EBLR + Spread',
    conditions: [
      'Up to 85% on-road funding for 4-wheelers',
      'Tenure up to 84 months',
      'Lowest rate on 4-wheelers with credit score 750+'
    ],
    eligibility: 'Salaried and self-employed individuals with min annual income ₹3 Lakh',
    processingFee: '₹1,000 + GST',
    sourceUrl: 'https://www.unionbankofindia.co.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Two-wheeler financing available under Union Miles Two Wheeler at 11.90%-13.25%.'
  },
  {
    bankName: 'Union Bank of India',
    bankCode: 'union',
    bankType: 'Public Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'Union Personal Loan Scheme',
    minRate: 11.10,
    maxRate: 15.20,
    rateType: 'Floating',
    benchmark: 'Union EBLR',
    conditions: [
      'Tie-up salary account holders get preferential rates',
      'Tenure up to 60 months',
      'Maximum loan ₹15 Lakh'
    ],
    eligibility: 'Permanent employees with at least 1 year service in current organization',
    processingFee: '0.50% to 1.00% of loan amount + GST',
    sourceUrl: 'https://www.unionbankofindia.co.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Self-employed personal loan brackets range between 12.50% and 15.20%.'
  },

  // ==========================================
  // 10. INDIAN BANK - Public Sector
  // ==========================================
  {
    bankName: 'Indian Bank',
    bankCode: 'indianbank',
    bankType: 'Public Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'IB Home Loan Scheme',
    minRate: 8.40,
    maxRate: 10.15,
    rateType: 'RLLR Linked',
    benchmark: 'Indian Bank RLLR (8.40%)',
    conditions: [
      'CIBIL score 800+ receives lowest 8.40% rate',
      '0.05% concession for women applicants',
      'Tenure up to 30 years'
    ],
    eligibility: 'Salaried and professional Indian residents with proven repayment capacity',
    processingFee: '0.25% of loan amount (Max ₹10,000) + GST',
    sourceUrl: 'https://indianbank.bank.in/en/interest-rates-on-personal-segment-loan-products',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Rates linked directly to RBI Repo Rate changes.'
  },
  {
    bankName: 'Indian Bank',
    bankCode: 'indianbank',
    bankType: 'Public Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'IB Vehicle Loan Scheme',
    minRate: 8.65,
    maxRate: 9.85,
    rateType: 'RLLR Linked',
    benchmark: 'RLLR (8.40% + 0.25%)',
    conditions: [
      'Up to 90% on-road funding for brand new cars',
      'Tenure up to 84 months',
      'CIBIL 750+ required for lowest bracket'
    ],
    eligibility: 'Salaried and self-employed individuals with min annual income ₹3 Lakh',
    processingFee: '0.25% of loan amount + GST',
    sourceUrl: 'https://indianbank.bank.in/en/interest-rates-on-personal-segment-loan-products',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'No prepayment penalty on individual vehicle loans.'
  },
  {
    bankName: 'Indian Bank',
    bankCode: 'indianbank',
    bankType: 'Public Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'IB Clean Loan (Personal Loan)',
    minRate: 10.75,
    maxRate: 14.50,
    rateType: 'Floating',
    benchmark: 'RLLR Linked',
    conditions: [
      'Salary account with Indian Bank required for lowest tier',
      'Tenure up to 60 months'
    ],
    eligibility: 'Salaried employees in Govt, PSUs, and reputed corporate firms',
    processingFee: '1.00% of loan amount + GST',
    sourceUrl: 'https://indianbank.bank.in/en/interest-rates-on-personal-segment-loan-products',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Quick processing for applicants with pre-existing banking relationship.'
  },

  // ==========================================
  // 11. BANK OF INDIA (BoI) - Public Sector
  // ==========================================
  {
    bankName: 'Bank of India',
    bankCode: 'boi',
    bankType: 'Public Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'Star Home Loan',
    minRate: 8.30,
    maxRate: 10.55,
    rateType: 'RBLR Linked',
    benchmark: 'RBLR (Repo Based Lending Rate)',
    conditions: [
      '8.30% base rate for credit score 800+ salaried applicants',
      'Tenure up to 30 years',
      'No prepayment charges'
    ],
    eligibility: 'Salaried and self-employed individuals aged 21-65',
    processingFee: '0.25% of loan amount (Min ₹1,500, Max ₹10,000) + GST',
    sourceUrl: 'https://bankofindia.co.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Star Diamond Home Loan provides overdraft benefits against housing balance.'
  },
  {
    bankName: 'Bank of India',
    bankCode: 'boi',
    bankType: 'Public Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'Star Vehicle Loan',
    minRate: 8.65,
    maxRate: 10.15,
    rateType: 'RBLR Linked',
    benchmark: 'RBLR Linked',
    conditions: [
      'Tenure up to 7 years (84 months)',
      'Up to 90% financing on on-road price',
      'Zero processing fee during seasonal festivals'
    ],
    eligibility: 'Salaried and self-employed individuals with min annual income ₹2.5 Lakh',
    processingFee: 'Nil to ₹1,000 + GST',
    sourceUrl: 'https://bankofindia.co.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Electric vehicles receive special 0.25% rate reduction.'
  },
  {
    bankName: 'Bank of India',
    bankCode: 'boi',
    bankType: 'Public Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'Star Personal Loan',
    minRate: 10.85,
    maxRate: 14.75,
    rateType: 'Floating',
    benchmark: 'RBLR Linked',
    conditions: [
      'Salaried employees with tie-up get lowest rate',
      'Tenure up to 60 months'
    ],
    eligibility: 'Permanent employees of corporate, Govt, and educational establishments',
    processingFee: '1.00% of loan amount + GST',
    sourceUrl: 'https://bankofindia.co.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Disbursement directly to verified bank account.'
  },

  // ==========================================
  // 12. IDFC FIRST BANK - Private Sector
  // ==========================================
  {
    bankName: 'IDFC FIRST Bank',
    bankCode: 'idfcfirst',
    bankType: 'Private Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'IDFC FIRST Home Loan',
    minRate: 8.85,
    maxRate: 10.50,
    rateType: 'EBLR Linked',
    benchmark: 'External Benchmark (Repo Linked)',
    conditions: [
      'Transparent digital processing via IDFC app',
      'Competitive rates for CIBIL 750+',
      'Tenure up to 30 years'
    ],
    eligibility: 'Salaried and self-employed professionals with established business',
    processingFee: 'Up to 0.50% of loan amount + GST',
    sourceUrl: 'https://www.idfcfirstbank.com/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Paperless digital appraisal and doorstep service.'
  },
  {
    bankName: 'IDFC FIRST Bank',
    bankCode: 'idfcfirst',
    bankType: 'Private Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'IDFC FIRST Instant Personal Loan',
    minRate: 10.99,
    maxRate: 23.99,
    rateType: 'Fixed',
    benchmark: 'Fixed Pricing Matrix',
    conditions: [
      'End-to-end paperless journey',
      'Instant disbursal in minutes',
      'Tenure from 12 to 60 months'
    ],
    eligibility: 'Salaried individuals with monthly salary >= ₹20,000',
    processingFee: 'Up to 3.00% of loan amount + GST',
    sourceUrl: 'https://www.idfcfirstbank.com/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Rates customized based on credit history and debt burden.'
  },
  {
    bankName: 'IDFC FIRST Bank',
    bankCode: 'idfcfirst',
    bankType: 'Private Sector',
    loanCategory: 'two_wheeler',
    loanCategoryName: 'Two-Wheeler Loan',
    schemeName: 'IDFC FIRST Two-Wheeler Financing',
    minRate: 14.99,
    maxRate: 24.00,
    rateType: 'Fixed',
    benchmark: 'Fixed Rate',
    conditions: [
      'Up to 100% on-road funding for electric two-wheelers',
      'Tenure from 12 to 48 months'
    ],
    eligibility: 'Salaried and self-employed individuals with basic KYC and income documents',
    processingFee: '2.50% of loan amount + GST',
    sourceUrl: 'https://www.idfcfirstbank.com/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Available directly at partnered dealership points across India.'
  },

  // ==========================================
  // 13. FEDERAL BANK - Private Sector
  // ==========================================
  {
    bankName: 'Federal Bank',
    bankCode: 'federal',
    bankType: 'Private Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'Federal Housing Loan',
    minRate: 8.80,
    maxRate: 10.25,
    rateType: 'EBLR Linked',
    benchmark: 'Federal Bank RLLR',
    conditions: [
      'Best rate applies to CIBIL 750+ applicants',
      'Tenure up to 30 years',
      'No prepayment charges for floating rate home loans'
    ],
    eligibility: 'Salaried individuals and business professionals aged 21-65 years',
    processingFee: '0.50% of loan amount (Min ₹3,000, Max ₹10,000) + GST',
    sourceUrl: 'https://www.federal.bank.in/-/interest-rates-on-loans-and-advances',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'NRI home loan options available under specialized foreign currency remittances.'
  },
  {
    bankName: 'Federal Bank',
    bankCode: 'federal',
    bankType: 'Private Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'Federal Auto Loan',
    minRate: 8.85,
    maxRate: 11.00,
    rateType: 'Floating',
    benchmark: 'EBLR Linked',
    conditions: [
      'Up to 100% on-road funding for selected passenger car models',
      'Tenure up to 84 months'
    ],
    eligibility: 'Resident and NRI individuals with annual income >= ₹3 Lakh',
    processingFee: '₹2,500 + GST',
    sourceUrl: 'https://www.federal.bank.in/-/interest-rates-on-loans-and-advances',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Special terms available for Federal Bank salary account holders.'
  },
  {
    bankName: 'Federal Bank',
    bankCode: 'federal',
    bankType: 'Private Sector',
    loanCategory: 'gold',
    loanCategoryName: 'Gold Loan',
    schemeName: 'Federal Bank Akshaya Gold Loan',
    minRate: 9.25,
    maxRate: 14.50,
    rateType: 'Floating',
    benchmark: 'Gold Benchmark Rate',
    conditions: [
      'Instant cash disbursal in 15 minutes',
      'High per-gram valuation',
      'Tenures from 6 months to 12 months'
    ],
    eligibility: 'Individuals aged 18+ possessing gold ornaments of 22 carat purity',
    processingFee: '₹100 to ₹500 + GST depending on loan size',
    sourceUrl: 'https://www.federal.bank.in/-/interest-rates-on-loans-and-advances',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Doorstep and digital branch services available.'
  },

  // ==========================================
  // 14. BANK OF MAHARASHTRA - Public Sector
  // ==========================================
  {
    bankName: 'Bank of Maharashtra',
    bankCode: 'mahabank',
    bankType: 'Public Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'Maha Super Housing Loan',
    minRate: 8.35,
    maxRate: 10.60,
    rateType: 'RLLR Linked',
    benchmark: 'RLLR (8.35%)',
    conditions: [
      '8.35% for CIBIL score 800+',
      '0.05% concession for women applicants',
      'Tenure up to 30 years'
    ],
    eligibility: 'Indian residents and NRIs aged 21-65 with verified income',
    processingFee: 'Nil during promotional periods (otherwise 0.25% max ₹10,000 + GST)',
    sourceUrl: 'https://bankofmaharashtra.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Consistently provides competitive home loan rates in the public banking sphere.'
  },
  {
    bankName: 'Bank of Maharashtra',
    bankCode: 'mahabank',
    bankType: 'Public Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'Maha Super Car Loan',
    minRate: 8.70,
    maxRate: 10.20,
    rateType: 'RLLR Linked',
    benchmark: 'RLLR Linked',
    conditions: [
      'Up to 90% on-road cost financing',
      'Tenure up to 84 months',
      'Zero prepayment penalty'
    ],
    eligibility: 'Salaried and self-employed individuals with min annual income ₹3 Lakh',
    processingFee: '₹1,000 + GST',
    sourceUrl: 'https://bankofmaharashtra.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Electric vehicle purchases receive 0.25% interest concession.'
  },
  {
    bankName: 'Bank of Maharashtra',
    bankCode: 'mahabank',
    bankType: 'Public Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'Maha Personal Loan',
    minRate: 10.70,
    maxRate: 14.50,
    rateType: 'Floating',
    benchmark: 'RLLR Linked',
    conditions: [
      'Salary account with Bank of Maharashtra for lowest bracket',
      'Tenure up to 60 months'
    ],
    eligibility: 'Employees of Central/State Govt, PSUs, and reputed corporates',
    processingFee: '1.00% of loan amount + GST',
    sourceUrl: 'https://bankofmaharashtra.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Disbursed directly into borrower savings account upon verification.'
  },

  // ==========================================
  // 15. CENTRAL BANK OF INDIA - Public Sector
  // ==========================================
  {
    bankName: 'Central Bank of India',
    bankCode: 'centralbank',
    bankType: 'Public Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'Cent Home Loan',
    minRate: 8.35,
    maxRate: 10.45,
    rateType: 'RLLR Linked',
    benchmark: 'Central Bank RLLR (8.35%)',
    conditions: [
      '8.35% for borrowers with CIBIL score 800+',
      'Women borrowers get 0.05% interest rebate',
      'Tenure up to 30 years'
    ],
    eligibility: 'Salaried, self-employed, professionals, and farmers with steady cashflow',
    processingFee: '0.25% of loan amount (Min ₹2,000, Max ₹10,000) + GST',
    sourceUrl: 'https://centralbankofindia.co.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'No prepayment penalty on floating rate loans.'
  },
  {
    bankName: 'Central Bank of India',
    bankCode: 'centralbank',
    bankType: 'Public Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'Cent Vehicle Loan',
    minRate: 8.65,
    maxRate: 9.95,
    rateType: 'RLLR Linked',
    benchmark: 'RLLR Linked',
    conditions: [
      'Up to 85% on-road funding',
      'Tenure up to 84 months',
      'Lowest rate on CIBIL 750+'
    ],
    eligibility: 'Salaried employees and business professionals with annual income >= ₹2.5 Lakh',
    processingFee: '₹1,000 + GST',
    sourceUrl: 'https://centralbankofindia.co.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Special rates for green/electric personal transport.'
  },
  {
    bankName: 'Central Bank of India',
    bankCode: 'centralbank',
    bankType: 'Public Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'Cent Personal Loan Scheme',
    minRate: 10.80,
    maxRate: 14.25,
    rateType: 'Floating',
    benchmark: 'RLLR Linked',
    conditions: [
      'Tie-up salary account preferred',
      'Tenure up to 60 months'
    ],
    eligibility: 'Permanent employees of corporate, Govt, and educational establishments',
    processingFee: '1.00% of loan amount + GST',
    sourceUrl: 'https://centralbankofindia.co.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Defence personnel receive preferential concession.'
  },

  // ==========================================
  // 16. INDIAN OVERSEAS BANK (IOB) - Public Sector
  // ==========================================
  {
    bankName: 'Indian Overseas Bank',
    bankCode: 'iob',
    bankType: 'Public Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'IOB Subhagruha Housing Loan',
    minRate: 8.40,
    maxRate: 10.60,
    rateType: 'RLLR Linked',
    benchmark: 'IOB RLLR (8.40%)',
    conditions: [
      'Base 8.40% for credit score 800+',
      'Women borrowers receive 0.05% concession',
      'Tenure up to 30 years'
    ],
    eligibility: 'Salaried and self-employed individuals with min 2 years steady earnings',
    processingFee: '0.25% of loan amount (Max ₹10,000) + GST',
    sourceUrl: 'https://www.iob.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Rate subject to credit risk assessment on IOB scoring matrix.'
  },
  {
    bankName: 'Indian Overseas Bank',
    bankCode: 'iob',
    bankType: 'Public Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'IOB Pushpaka Vehicle Loan',
    minRate: 8.75,
    maxRate: 10.25,
    rateType: 'RLLR Linked',
    benchmark: 'RLLR Linked',
    conditions: [
      'Up to 90% on-road cost financing',
      'Tenure up to 84 months'
    ],
    eligibility: 'Salaried and self-employed individuals with min annual income ₹3 Lakh',
    processingFee: '0.25% of loan amount + GST',
    sourceUrl: 'https://www.iob.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'No foreclosure charges on individual borrower accounts.'
  },

  // ==========================================
  // 17. UCO BANK - Public Sector
  // ==========================================
  {
    bankName: 'UCO Bank',
    bankCode: 'ucobank',
    bankType: 'Public Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'UCO Home Loan',
    minRate: 8.45,
    maxRate: 10.35,
    rateType: 'RLLR Linked',
    benchmark: 'UCO RLLR (8.45%)',
    conditions: [
      'Lowest rate tier for CIBIL 800+',
      'Tenure up to 30 years',
      'No prepayment penalty'
    ],
    eligibility: 'Salaried and business persons aged 21-70 years',
    processingFee: '0.25% of loan amount (Max ₹15,000) + GST',
    sourceUrl: 'https://www.ucobank.com/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'UCO Bank home loans linked directly to RBI repo rate adjustments.'
  },
  {
    bankName: 'UCO Bank',
    bankCode: 'ucobank',
    bankType: 'Public Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'UCO Car Loan Scheme',
    minRate: 8.70,
    maxRate: 10.10,
    rateType: 'RLLR Linked',
    benchmark: 'RLLR Linked',
    conditions: [
      'Up to 85% on-road funding for 4-wheelers',
      'Tenure up to 84 months'
    ],
    eligibility: 'Individuals with steady income of at least ₹2.5 Lakh per annum',
    processingFee: '₹1,000 + GST',
    sourceUrl: 'https://www.ucobank.com/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Interest concession for purchase of new electric cars.'
  },

  // ==========================================
  // 18. YES BANK - Private Sector
  // ==========================================
  {
    bankName: 'YES BANK',
    bankCode: 'yesbank',
    bankType: 'Private Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'YES Home Loan',
    minRate: 8.95,
    maxRate: 11.50,
    rateType: 'EBLR Linked',
    benchmark: 'YES Repo Linked Lending Rate',
    conditions: [
      'Quick digital sanction within 48 hours',
      'CIBIL 750+ required for sub-9.25% bracket',
      'Tenure up to 35 years'
    ],
    eligibility: 'Salaried professionals and self-employed business owners',
    processingFee: 'Up to 0.75% of loan amount + applicable GST',
    sourceUrl: 'https://www.yesbank.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Customized repayment structures available for high-net-worth borrowers.'
  },
  {
    bankName: 'YES BANK',
    bankCode: 'yesbank',
    bankType: 'Private Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'YES BANK Personal Loan',
    minRate: 10.99,
    maxRate: 21.00,
    rateType: 'Fixed',
    benchmark: 'Fixed Pricing',
    conditions: [
      'Tenures up to 60 months',
      'Min monthly income ₹25,000',
      'Digital verification via net banking'
    ],
    eligibility: 'Salaried individuals aged 21-60 with min 2 years overall work experience',
    processingFee: 'Up to 2.50% of loan amount + GST',
    sourceUrl: 'https://www.yesbank.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Part-prepayment permissible after 12 completed EMI instalments.'
  },
  {
    bankName: 'YES BANK',
    bankCode: 'yesbank',
    bankType: 'Private Sector',
    loanCategory: 'car',
    loanCategoryName: 'Car Loan',
    schemeName: 'YES Auto Loan',
    minRate: 9.25,
    maxRate: 13.00,
    rateType: 'Fixed',
    benchmark: 'Fixed Pricing',
    conditions: [
      'Up to 100% on-road funding for premium car models',
      'Tenures up to 84 months'
    ],
    eligibility: 'Salaried and self-employed individuals with min annual income ₹3 Lakh',
    processingFee: 'Up to ₹5,000 + GST',
    sourceUrl: 'https://www.yesbank.in/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Attractive rates on luxury and EV vehicle models.'
  },

  // ==========================================
  // 19. INDUSIND BANK - Private Sector
  // ==========================================
  {
    bankName: 'IndusInd Bank',
    bankCode: 'indusind',
    bankType: 'Private Sector',
    loanCategory: 'home',
    loanCategoryName: 'Home Loan',
    schemeName: 'Indus Home Loan',
    minRate: 8.90,
    maxRate: 11.75,
    rateType: 'EBLR Linked',
    benchmark: 'IndusInd EBLR (Repo Linked)',
    conditions: [
      'Competitive floating rates for CIBIL 750+',
      'Tenure up to 30 years',
      'No prepayment charges for individual borrowers'
    ],
    eligibility: 'Salaried and self-employed resident Indians with steady income proof',
    processingFee: 'Up to 0.75% of loan amount (Min ₹3,500) + GST',
    sourceUrl: 'https://www.indusind.com/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Home loan balance transfer with top-up facility available.'
  },
  {
    bankName: 'IndusInd Bank',
    bankCode: 'indusind',
    bankType: 'Private Sector',
    loanCategory: 'personal',
    loanCategoryName: 'Personal Loan',
    schemeName: 'IndusInd Instant Personal Loan',
    minRate: 10.49,
    maxRate: 24.00,
    rateType: 'Fixed',
    benchmark: 'Fixed Pricing',
    conditions: [
      'End-to-end paperless video KYC',
      'Disbursal in under 30 minutes',
      'Tenure from 12 to 60 months'
    ],
    eligibility: 'Salaried individuals with monthly income >= ₹25,000',
    processingFee: 'Up to 2.50% of loan amount + GST',
    sourceUrl: 'https://www.indusind.com/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Best rate bracket applies to top-tier corporate employees.'
  },
  {
    bankName: 'IndusInd Bank',
    bankCode: 'indusind',
    bankType: 'Private Sector',
    loanCategory: 'two_wheeler',
    loanCategoryName: 'Two-Wheeler Loan',
    schemeName: 'IndusInd Two-Wheeler Finance',
    minRate: 13.50,
    maxRate: 22.00,
    rateType: 'Fixed',
    benchmark: 'Fixed Rate',
    conditions: [
      'One of India\'s largest two-wheeler retail financiers',
      'Fast spot approvals at showroom locations',
      'Tenure up to 48 months'
    ],
    eligibility: 'Salaried and self-employed individuals with basic KYC',
    processingFee: '2.00% to 3.00% of loan amount + GST',
    sourceUrl: 'https://www.indusind.com/',
    lastVerified: '2026-03-15',
    status: 'Verified',
    notes: 'Up to 95% funding on ex-showroom price for popular scooters and motorcycles.'
  }
];

export const LOAN_CATEGORIES = [
  { id: 'all', name: 'All Loans', description: 'Compare rates across all retail credit categories' },
  { id: 'home', name: 'Home Loans', description: 'Housing purchase, construction & plot loans (up to 30 yrs)' },
  { id: 'personal', name: 'Personal Loans', description: 'Unsecured instant cashflow & emergency loans (up to 5 yrs)' },
  { id: 'car', name: 'Car Loans', description: 'New & used four-wheeler passenger vehicle finance (up to 7 yrs)' },
  { id: 'education', name: 'Education Loans', description: 'Higher studies in India and abroad with moratorium' },
  { id: 'two_wheeler', name: 'Two-Wheeler Loans', description: 'Motorcycles, scooters and EV two-wheelers (up to 4 yrs)' },
  { id: 'gold', name: 'Gold Loans', description: 'Secured instant credit against gold ornaments with minimal paperwork' }
];
