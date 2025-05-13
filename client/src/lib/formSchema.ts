import { z } from "zod";

// Business Packages (Based on official PlataPay franchise offerings - https://platapay.ph/franchise)
export const businessPackages = [
  {
    id: "basic",
    name: "Basic Franchise",
    description: "Entry-level franchise package for starting entrepreneurs",
    monthlyFee: 3000,
    setupFee: 15000,
    features: [
      "Remittance services",
      "Bills payment",
      "E-loading",
      "Basic financial services",
      "POS terminal",
      "Basic training",
      "Customer service support"
    ]
  },
  {
    id: "standard",
    name: "Standard Franchise",
    description: "Complete solution for established businesses",
    monthlyFee: 5000,
    setupFee: 25000,
    features: [
      "All Basic franchise features",
      "Micro-lending services",
      "Insurance products",
      "Digital banking services",
      "Enhanced signage package",
      "Comprehensive training program",
      "Marketing materials",
      "Priority customer support"
    ]
  },
  {
    id: "premium",
    name: "Premium Franchise",
    description: "Full-featured solution for serious entrepreneurs",
    monthlyFee: 8000,
    setupFee: 50000,
    features: [
      "All Standard franchise features",
      "Exclusive territorial rights",
      "Expanded product offerings",
      "Advanced financial services",
      "Multiple POS terminals",
      "Customized store design",
      "Higher commission rates",
      "Business development support",
      "Premium marketing package",
      "24/7 dedicated support"
    ]
  }
];

// Document types required
export const requiredDocuments = [
  {
    id: "id_front",
    name: "ID Front",
    description: "Front side of government-issued ID",
    required: true
  },
  {
    id: "id_back",
    name: "ID Back",
    description: "Back side of government-issued ID",
    required: true
  },
  {
    id: "business_permit",
    name: "Business Permit",
    description: "Valid business permit if applicable",
    required: false
  },
  {
    id: "proof_of_address",
    name: "Proof of Address",
    description: "Utility bill or other proof of address (not older than 3 months)",
    required: true
  },
  {
    id: "tax_certificate",
    name: "Tax Certificate",
    description: "Latest tax certificate or BIR registration",
    required: false
  }
];

// Terms and conditions text
export const termsAndConditionsText = `
TERMS AND CONDITIONS FOR PLATAPAY AGENT PROGRAM

By agreeing to these Terms and Conditions, you ("Agent") enter into a binding agreement with PlataPay ("Company") for the provision of financial agent services.

This is a summary of key terms. For the complete terms and conditions, please visit our official website at: https://platapay.ph/terms

1. AGENT RESPONSIBILITIES
   1.1 The Agent shall complete all required training provided by the Company.
   1.2 The Agent shall maintain proper documentation of all transactions.
   1.3 The Agent shall adhere to all applicable laws and regulations.
   1.4 The Agent shall maintain confidentiality of customer information.

2. COMMISSION STRUCTURE
   2.1 Commission rates are outlined in the selected package.
   2.2 Commissions will be calculated and paid monthly.
   2.3 The Company reserves the right to modify commission structures with 30 days notice.

3. TERMINATION
   3.1 Either party may terminate this agreement with 30 days written notice.
   3.2 The Company may terminate immediately for violations of terms or applicable laws.

4. COMPLIANCE
   4.1 The Agent must comply with all anti-money laundering (AML) and know-your-customer (KYC) regulations.
   4.2 The Agent must report any suspicious transactions to the Company immediately.

5. LIMITATION OF LIABILITY
   5.1 The Company shall not be liable for indirect, incidental, or consequential damages.
   5.2 The Agent indemnifies the Company against claims arising from Agent's actions.

6. AMENDMENTS
   6.1 The Company reserves the right to amend these terms with 30 days notice.
   6.2 Continued service after amendment constitutes acceptance of new terms.

7. GOVERNING LAW
   7.1 This agreement shall be governed by the laws of the Philippines.
   7.2 Any disputes shall be resolved through arbitration in Manila.

8. PRIVACY POLICY
   8.1 Your personal information will be processed in accordance with our Privacy Policy.
   8.2 For details on how we collect, use and protect your data, please visit: https://platapay.ph/privacy

By submitting your application, you confirm that you have read, understood, and agree to these Terms and Conditions and our Privacy Policy.
`;
