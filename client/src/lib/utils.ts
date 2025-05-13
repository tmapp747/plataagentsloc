import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneNumber(phoneNumber: string | undefined): string {
  if (!phoneNumber) return '';
  
  // Strip non-numeric characters and ensure it doesn't start with +63
  const cleaned = phoneNumber.replace(/\D/g, '').replace(/^63/, '');
  
  // Format numbers in the pattern XXX-XXX-XXXX
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  }
  
  return cleaned;
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined) return '';
  
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function getIdTypeDisplay(idType: string | undefined): string {
  if (!idType) return '';
  
  const idTypes: Record<string, string> = {
    'passport': 'Passport',
    'drivers_license': "Driver's License",
    'sss': 'SSS ID',
    'philhealth': 'PhilHealth ID',
    'voters_id': "Voter's ID",
    'national_id': 'National ID',
  };
  
  return idTypes[idType] || idType;
}

export function getStatusColor(status: string | undefined): string {
  if (!status) return 'bg-gray-200 text-gray-800';
  
  const statusColors: Record<string, string> = {
    'draft': 'bg-yellow-100 text-yellow-800',
    'submitted': 'bg-blue-100 text-blue-800',
    'under_review': 'bg-purple-100 text-purple-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
  };
  
  return statusColors[status] || 'bg-gray-200 text-gray-800';
}
