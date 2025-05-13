import { z } from "zod";

// Business Packages (Based on official PlataPay franchise offerings - https://platapay.ph/franchise)
export const businessPackages = [
  {
    id: "silver",
    name: "Silver Package",
    description: "Perfect for first-time entrepreneurs in growing communities",
    monthlyFee: 3500,
    setupFee: 20000,
    features: [
      "Remittance services (domestic & international)",
      "Bills payment (utilities, loans, etc.)",
      "E-loading for all networks",
      "Basic cash-in/cash-out services",
      "PlataPay POS device",
      "Initial training program",
      "Basic marketing materials",
      "Standard customer support (9am-6pm)"
    ]
  },
  {
    id: "gold",
    name: "Gold Package",
    description: "Ideal for established small businesses in urban locations",
    monthlyFee: 6000,
    setupFee: 35000,
    features: [
      "All Silver package features",
      "Insurance product offerings",
      "Micro-lending services",
      "Advanced e-wallet integrations",
      "Enhanced PlataPay signage",
      "Comprehensive business training",
      "Expanded marketing toolkit",
      "Priority customer support (8am-8pm)",
      "Monthly business review sessions"
    ]
  },
  {
    id: "platinum",
    name: "Platinum Package",
    description: "Premium solution for serious entrepreneurs in prime locations",
    monthlyFee: 10000,
    setupFee: 65000,
    features: [
      "All Gold package features",
      "Exclusive territorial rights",
      "Advanced financial product offerings",
      "Multiple POS terminals",
      "Custom store branding package",
      "Premium commission rates (+2%)",
      "Executive business development support",
      "Complete marketing system",
      "24/7 dedicated support hotline",
      "Quarterly business strategy sessions"
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
