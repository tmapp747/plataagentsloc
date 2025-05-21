/**
 * Validation Service
 * This service provides validation and standardized data for various form fields
 * Instead of storing these options in the database, we serve them via API
 */

interface IDType {
  code: string;
  name: string;
  format?: string;
  validationRegex?: string;
}

class ValidationService {
  // Cache for ID types
  private idTypesCache: IDType[] | null = null;

  /**
   * Get all valid Philippine ID types
   */
  async getIDTypes(): Promise<IDType[]> {
    // If we have a cached result, return it
    if (this.idTypesCache) {
      return this.idTypesCache;
    }

    // In a real application, this could fetch from an external API
    // For this implementation, we'll use a comprehensive list of Philippine IDs
    const idTypes: IDType[] = [
      { code: "passport", name: "Philippine Passport", format: "P#######A" },
      { code: "drivers_license", name: "Drivers License", format: "A##-##-######" },
      { code: "sss", name: "SSS ID / UMID", format: "##-#######-#" },
      { code: "gsis", name: "GSIS ID / UMID", format: "GSIS########" },
      { code: "philhealth", name: "PhilHealth ID", format: "##-#########-#" },
      { code: "tin", name: "Tax Identification Number (TIN)", format: "###-###-###-###" },
      { code: "postal", name: "Postal ID", format: "####-#####-####" },
      { code: "voters", name: "Voters ID", format: "Varies" },
      { code: "prc", name: "Professional Regulation Commission (PRC) ID", format: "####-#####" },
      { code: "senior_citizen", name: "Senior Citizen ID", format: "SC-########" },
      { code: "ofw", name: "OFW ID", format: "Varies" },
      { code: "national_id", name: "Philippine National ID (PhilSys)", format: "PHIN-########-#" },
      { code: "pagibig", name: "Pag-IBIG ID", format: "####-####-####" },
      { code: "pwd", name: "PWD ID", format: "######-#####-#" },
      { code: "nbi", name: "NBI Clearance", format: "############" },
      { code: "police", name: "Police Clearance", format: "Varies" },
      { code: "barangay", name: "Barangay ID", format: "Varies" },
      { code: "company", name: "Company ID", format: "Varies" }
    ];
    
    // Cache the results
    this.idTypesCache = idTypes;
    
    return idTypes;
  }

  /**
   * Get business types for the application
   */
  async getBusinessTypes(): Promise<string[]> {
    return [
      "retail",
      "financial_services",
      "food_and_beverage",
      "sari_sari_store",
      "electronic_shop",
      "education",
      "transportation",
      "remittance",
      "grocery",
      "pharmacy",
      "other"
    ];
  }

  /**
   * Get business natures available in the application
   */
  async getBusinessNatures(): Promise<string[]> {
    return [
      "micro_enterprise",
      "small_business",
      "medium_enterprise",
      "sole_proprietorship",
      "partnership",
      "corporation",
      "cooperative",
      "franchise",
      "startup",
      "home_based"
    ];
  }

  /**
   * Get operating year ranges
   */
  async getYearsOperating(): Promise<string[]> {
    return [
      "0-1",
      "1-3",
      "3-5",
      "5-10",
      "10+"
    ];
  }
  
  /**
   * Get transaction volume ranges
   */
  async getDailyTransactions(): Promise<string[]> {
    return [
      "less_than_10",
      "10-50",
      "50-100",
      "100-500",
      "500+"
    ];
  }

  /**
   * Get available package types
   */
  async getPackageTypes(): Promise<any[]> {
    return [
      {
        code: "basic",
        name: "Basic Package",
        monthlyFee: "500",
        setupFee: "1000",
        features: [
          "Cash-in/Cash-out services",
          "Bill payments",
          "Basic support"
        ]
      },
      {
        code: "premium",
        name: "Premium Package",
        monthlyFee: "1000",
        setupFee: "2000",
        features: [
          "Cash-in/Cash-out services",
          "Bill payments",
          "Remittance services",
          "Priority support",
          "Marketing materials"
        ]
      },
      {
        code: "enterprise",
        name: "Enterprise Package",
        monthlyFee: "2500",
        setupFee: "5000",
        features: [
          "All Premium features",
          "Loan facilitation",
          "Insurance products",
          "Dedicated account manager",
          "Advanced reporting",
          "Custom branding"
        ]
      }
    ];
  }
}

export const validationService = new ValidationService();