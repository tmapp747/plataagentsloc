import { Application } from "@shared/schema";
import { formatDate, getIdTypeDisplay } from "./formatters";

/**
 * Convert application data to CSV format
 * @param applications - Array of application objects to convert
 * @returns CSV formatted string
 */
export function convertApplicationsToCSV(applications: Application[]): string {
  // Define CSV headers
  const headers = [
    "Application ID",
    "Submission Date",
    "Status",
    "Full Name",
    "Email",
    "Phone",
    "ID Type",
    "ID Number",
    "Date of Birth",
    "Educational Background",
    "Home Address",
    "Business Address",
    "Package Type",
    "Monthly Fee",
    "Setup Fee",
    "Business Experience",
    "Financial Experience"
  ];

  // Create CSV header row
  let csvContent = headers.join(",") + "\r\n";

  // Add application data rows
  applications.forEach(app => {
    // Parse JSON address data if needed
    const addressData = app.address && typeof app.address === 'string' ? 
      JSON.parse(app.address) : app.address || {};
    
    const businessLocationData = app.businessLocation && typeof app.businessLocation === 'string' ? 
      JSON.parse(app.businessLocation) : app.businessLocation || {};
    
    const homeAddress = addressData ? 
      `${addressData.streetAddress || ''}, ${addressData.barangay || ''}, ${addressData.city || ''}, ${addressData.province || ''}`.replace(/^[, ]+|[, ]+$/g, '') : 
      "";
    
    const businessAddress = businessLocationData && Object.keys(businessLocationData).length > 0 ? 
      `${businessLocationData.streetAddress || ''}, ${businessLocationData.barangay || ''}, ${businessLocationData.city || ''}, ${businessLocationData.province || ''}`.replace(/^[, ]+|[, ]+$/g, '') : 
      app.businessLocationSameAsAddress ? homeAddress : "";

    const row = [
      app.applicationId || "",
      app.submitDate ? formatDate(app.submitDate) : "",
      app.status || "in_progress",
      `${app.firstName || ""} ${app.middleName || ""} ${app.lastName || ""}`.trim(),
      app.email || "",
      app.phoneNumber || "",
      app.idType ? getIdTypeDisplay(app.idType) : "",
      app.idNumber || "",
      app.dateOfBirth ? formatDate(app.dateOfBirth) : "",
      app.highestEducation || "",
      homeAddress,
      businessAddress,
      app.packageType || "",
      app.monthlyFee ? `₱${app.monthlyFee}` : "",
      app.setupFee ? `₱${app.setupFee}` : "",
      app.businessBackground || "",
      app.financialServicesBackground || ""
    ];

    // Escape CSV special characters and add quotes around each field
    const escapedRow = row.map(field => {
      // Replace double quotes with two double quotes (CSV escape format)
      const escaped = String(field).replace(/"/g, '""');
      return `"${escaped}"`;
    });

    // Add row to CSV content
    csvContent += escapedRow.join(",") + "\r\n";
  });

  return csvContent;
}

/**
 * Generate CSV file name with timestamp
 * @returns CSV file name with timestamp
 */
export function generateCSVFilename(): string {
  const date = new Date();
  const timestamp = date.toISOString().replace(/[:.]/g, '-').replace('T', '_').split('_')[0];
  return `platapay_applications_${timestamp}.csv`;
}