# PlataPay Agent Application Template

## Personal Information
```json
{
  "firstName": "",
  "middleName": "",
  "lastName": "",
  "email": "",
  "phoneNumber": "",
  "dateOfBirth": "MM/DD/YYYY",
  "idType": "drivers_license", // options: passport, drivers_license, national_id, philhealth, sss, tin, voters_id, postal_id, other
  "idNumber": "",
  "highestEducation": "" // e.g., "High School", "College", "Bachelor's Degree", "Master's Degree", etc.
}
```

## Background Check
```json
{
  "hasCriminalRecord": false,
  "hasBankruptcyHistory": false,
  "hasFinancialCrimeHistory": false
}
```

## Business Experience
```json
{
  "businessBackground": "", // Brief business experience description
  "financialServicesBackground": "", // Brief financial services experience description
  "yearsInBusiness": 0,
  "currentOccupation": "",
  "otherActivities": "" // Other relevant activities
}
```

## Address Details
```json
{
  "address": {
    "streetAddress": "",
    "barangay": "",
    "city": "",
    "province": "",
    "region": "",
    "landmark": "",
    "latitude": 0,
    "longitude": 0
  },
  "businessLocationSameAsAddress": true, // set to false if different
  "businessLocation": {
    "streetAddress": "",
    "barangay": "",
    "city": "",
    "province": "",
    "region": "",
    "landmark": "",
    "latitude": 0,
    "longitude": 0
  }
}
```

## Package Selection
```json
{
  "packageType": "basic", // options: basic, standard, premium
  "monthlyFee": 500, // Basic: 500, Standard: 1000, Premium: 2000
  "setupFee": 1000 // Basic: 1000, Standard: 2000, Premium: 3000
}
```

## Documents
```json
{
  "documentIds": [
    // Leave blank - these will be filled in when documents are uploaded
  ]
}
```

## Agreement
```json
{
  "termsAgreed": true,
  "privacyPolicyAgreed": true,
  "signatureDataUrl": "", // Base64 image data (will be empty until signature provided)
  "signatureDate": "MM/DD/YYYY"
}
```

## Application Status
```json
{
  "status": "draft", // options: draft, submitted, under_review, approved, rejected
  "submitDate": null, // Will be filled automatically upon submission
  "resumeToken": "" // Will be generated automatically
}
```

## INSTRUCTIONS:
1. Fill out all the required fields in the JSON format above
2. You can leave the optional fields blank if not applicable
3. For fields like `latitude` and `longitude`, you can use approximate values
4. The `documentIds` will be populated when the actual documents are uploaded
5. The `signatureDataUrl` will be populated when the signature is provided
6. The `status` and `resumeToken` will be managed by the system