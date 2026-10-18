/**
 * Formatting utilities for Indian Rupee currency, percentages, and numbers.
 */

export const formatINR = (amount, maximumFractionDigits = 0) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  
  // Format with Indian numbering system (e.g., ₹1,50,000)
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits
  });

  return formatter.format(amount);
};

export const formatNumber = (num, maxDecimals = 0) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0
  }).format(num);
};

export const formatPercent = (rate, decimals = 1) => {
  if (rate === undefined || rate === null || isNaN(rate)) return '0%';
  return `${Number(rate).toFixed(decimals)}%`;
};
