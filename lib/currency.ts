/**
 * Formats a number to Nepali Rupee (NPR) format
 * Examples:
 * 1000 -> 1,000
 * 10000 -> 10,000
 * 100000 -> 1,00,000
 * 1000000 -> 10,00,000
 * 10000000 -> 1,00,00,000
 */
export function formatIndianCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  // Convert to string and split into integer and decimal parts
  const [integerPart, decimalPart] = absoluteAmount.toFixed(2).split('.');
  
  // Indian numbering system: First group of 3, then groups of 2
  let lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);
  
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  
  // Add commas for groups of 2 digits
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  
  return `${isNegative ? '-' : ''}NPR ${formatted}.${decimalPart}`;
}

/**
 * Format currency without NPR prefix
 */
export function formatIndianNumber(amount: number): string {
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  
  const [integerPart, decimalPart] = absoluteAmount.toFixed(2).split('.');
  
  let lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);
  
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  
  return `${isNegative ? '-' : ''}${formatted}.${decimalPart}`;
}
