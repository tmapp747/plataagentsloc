/**
 * Format a date as MM/DD/YYYY
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

/**
 * Get display name for ID type
 * @param idType ID type code
 * @returns Display name for ID type
 */
export function getIdTypeDisplay(idType: string): string {
  const idTypes: Record<string, string> = {
    "passport": "Passport",
    "drivers_license": "Driver's License",
    "national_id": "National ID",
    "philhealth": "PhilHealth ID",
    "sss": "SSS ID",
    "tin": "TIN ID",
    "voters_id": "Voter's ID",
    "postal_id": "Postal ID",
    "other": "Other ID"
  };
  
  return idTypes[idType] || idType;
}

/**
 * Format currency as Philippine Peso
 * @param amount Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(value);
}