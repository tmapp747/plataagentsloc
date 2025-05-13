// Import required modules
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

// Initialize database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Function to seed a single application
async function seedApplication(applicationData) {
  try {
    // Generate application ID if not provided
    if (!applicationData.applicationId) {
      applicationData.applicationId = nanoid(10);
    }
    
    // Generate resume token if not provided
    if (!applicationData.resumeToken) {
      applicationData.resumeToken = nanoid(12);
    }
    
    // Add created/updated timestamps
    const now = new Date();
    applicationData.createdAt = now;
    applicationData.updatedAt = now;
    
    // Convert address objects to JSON strings if they exist
    if (applicationData.address && typeof applicationData.address === 'object') {
      applicationData.address = JSON.stringify(applicationData.address);
    }
    
    if (applicationData.businessLocation && typeof applicationData.businessLocation === 'object') {
      applicationData.businessLocation = JSON.stringify(applicationData.businessLocation);
    }
    
    // Insert application into database
    const result = await db.execute(
      `INSERT INTO agent_applications (
        application_id, first_name, middle_name, last_name, email, phone_number,
        date_of_birth, id_type, id_number, highest_education, has_criminal_record,
        has_bankruptcy_history, has_financial_crime_history, business_background,
        financial_services_background, years_in_business, current_occupation,
        other_activities, address, business_location_same_as_address, business_location,
        package_type, monthly_fee, setup_fee, status, resume_token, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
      ) RETURNING id`,
      [
        applicationData.applicationId,
        applicationData.firstName || null,
        applicationData.middleName || null,
        applicationData.lastName || null,
        applicationData.email || null,
        applicationData.phoneNumber || null,
        applicationData.dateOfBirth ? new Date(applicationData.dateOfBirth) : null,
        applicationData.idType || null,
        applicationData.idNumber || null,
        applicationData.highestEducation || null,
        applicationData.hasCriminalRecord || false,
        applicationData.hasBankruptcyHistory || false,
        applicationData.hasFinancialCrimeHistory || false,
        applicationData.businessBackground || null,
        applicationData.financialServicesBackground || null,
        applicationData.yearsInBusiness || null,
        applicationData.currentOccupation || null,
        applicationData.otherActivities || null,
        applicationData.address || null,
        applicationData.businessLocationSameAsAddress || false,
        applicationData.businessLocation || null,
        applicationData.packageType || null,
        applicationData.monthlyFee || null,
        applicationData.setupFee || null,
        applicationData.status || 'draft',
        applicationData.resumeToken,
        applicationData.createdAt,
        applicationData.updatedAt
      ]
    );
    
    console.log(`Successfully inserted application with ID: ${applicationData.applicationId}`);
    return result.rows[0].id;
  } catch (error) {
    console.error('Error seeding application:', error);
    throw error;
  }
}

// Main function to seed from JSON file
async function seedFromJSON(filePath) {
  try {
    // Read and parse JSON file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (Array.isArray(data)) {
      // Handle array of applications
      for (const application of data) {
        await seedApplication(application);
      }
      console.log(`Successfully seeded ${data.length} applications`);
    } else {
      // Handle single application
      await seedApplication(data);
      console.log('Successfully seeded 1 application');
    }
  } catch (error) {
    console.error('Error seeding from JSON:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Check if file path is provided as command line argument
const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a JSON file path as an argument.');
  process.exit(1);
}

// Run the seed function
seedFromJSON(filePath)
  .then(() => console.log('Seeding completed'))
  .catch(error => console.error('Seeding failed:', error));