import { z } from "zod";

// Business Packages
export const businessPackages = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for new small businesses",
    monthlyFee: 999,
    setupFee: 1500,
    features: [
      "Basic financial services",
      "Mobile app support",
      "Monthly reports",
      "Up to 100 transactions per month",
      "Email support"
    ]
  },
  {
    id: "business",
    name: "Business",
    description: "Ideal for established businesses",
    monthlyFee: 2499,
    setupFee: 2500,
    features: [
      "All Starter features",
      "Dedicated account manager",
      "Priority support",
      "Up to 500 transactions per month",
      "Advanced reporting",
      "API access"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For high-volume business needs",
    monthlyFee: 4999,
    setupFee: 5000,
    features: [
      "All Business features",
      "Unlimited transactions",
      "Custom integrations",
      "24/7 support",
      "Advanced security features",
      "Multi-user access",
      "Customized solutions"
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

By submitting your application, you confirm that you have read, understood, and agree to these Terms and Conditions.
`;
