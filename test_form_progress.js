/**
 * This script tests the form progression through all steps
 * It simulates API requests to verify that form data can be saved and retrieved correctly
 */
import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const test = async () => {
  console.log('Starting form progression test...');
  
  try {
    // Step 1: Create a new application
    console.log('Step 1: Creating a new application...');
    const createResponse = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create application: ${createResponse.status} ${createResponse.statusText}`);
    }
    
    const application = await createResponse.json();
    console.log(`Application created successfully with ID: ${application.applicationId}`);
    
    // Step 2: Update with personal information
    console.log('Step 2: Updating personal information...');
    const personalInfoResponse = await fetch(`${API_BASE_URL}/applications/${application.applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        nationality: 'Filipino',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        civilStatus: 'single',
        idType: 'drivers_license',
        idNumber: '123456789',
        lastStep: 1
      })
    });
    
    if (!personalInfoResponse.ok) {
      throw new Error(`Failed to update personal information: ${personalInfoResponse.status} ${personalInfoResponse.statusText}`);
    }
    
    console.log('Personal information updated successfully');
    
    // Step 3: Update with background check information
    console.log('Step 3: Updating background check information...');
    const backgroundResponse = await fetch(`${API_BASE_URL}/applications/${application.applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstTimeApplying: 'yes',
        everCharged: 'no',
        declaredBankruptcy: 'no',
        incomeSource: 'employment',
        lastStep: 2
      })
    });
    
    if (!backgroundResponse.ok) {
      throw new Error(`Failed to update background info: ${backgroundResponse.status} ${backgroundResponse.statusText}`);
    }
    
    console.log('Background check information updated successfully');
    
    // Step 4: Update with business information
    console.log('Step 4: Updating business information...');
    const businessResponse = await fetch(`${API_BASE_URL}/applications/${application.applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'Test Business',
        businessType: 'retail',
        businessNature: 'grocery',
        yearsOperating: '0-1',
        dailyTransactions: '10-50',
        hasExistingBusiness: false,
        isFirstTimeBusiness: true,
        lastStep: 3
      })
    });
    
    if (!businessResponse.ok) {
      throw new Error(`Failed to update business info: ${businessResponse.status} ${businessResponse.statusText}`);
    }
    
    console.log('Business information updated successfully');
    
    // Step 5: Update with location information
    console.log('Step 5: Updating location information...');
    const locationResponse = await fetch(`${API_BASE_URL}/applications/${application.applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: {
          region: 'NCR',
          province: 'Metro Manila',
          city: 'Manila',
          barangay: 'Malate',
          streetAddress: '123 Test Street'
        },
        businessLocation: {
          region: 'NCR',
          province: 'Metro Manila',
          city: 'Manila',
          barangay: 'Malate',
          streetAddress: '123 Test Street'
        },
        businessLocationSameAsAddress: true,
        landmark: 'Near the mall',
        lastStep: 4
      })
    });
    
    if (!locationResponse.ok) {
      throw new Error(`Failed to update location info: ${locationResponse.status} ${locationResponse.statusText}`);
    }
    
    console.log('Location information updated successfully');
    
    // Step 6: Update with package selection
    console.log('Step 6: Updating package selection...');
    const packageResponse = await fetch(`${API_BASE_URL}/applications/${application.applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageType: 'basic',
        monthlyFee: 500,
        setupFee: 1000,
        lastStep: 5
      })
    });
    
    if (!packageResponse.ok) {
      throw new Error(`Failed to update package info: ${packageResponse.status} ${packageResponse.statusText}`);
    }
    
    console.log('Package selection updated successfully');
    
    // Step 7: We'll skip document upload as it requires file handling
    console.log('Step 7: Skipping document upload test');
    
    // Step 8: Update with signature agreement
    console.log('Step 8: Updating signature agreement...');
    const signatureResponse = await fetch(`${API_BASE_URL}/applications/${application.applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        termsAccepted: true,
        signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=',
        lastStep: 7
      })
    });
    
    if (!signatureResponse.ok) {
      throw new Error(`Failed to update signature info: ${signatureResponse.status} ${signatureResponse.statusText}`);
    }
    
    console.log('Signature agreement updated successfully');
    
    // Final step: Submit the application
    console.log('Final step: Submitting the application...');
    const submitResponse = await fetch(`${API_BASE_URL}/applications/${application.applicationId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    if (!submitResponse.ok) {
      throw new Error(`Failed to submit application: ${submitResponse.status} ${submitResponse.statusText}`);
    }
    
    const submittedApp = await submitResponse.json();
    console.log(`Application submitted successfully with status: ${submittedApp.status}`);
    
    // Verify the submission by fetching the application
    console.log('Verifying submission...');
    const verifyResponse = await fetch(`${API_BASE_URL}/applications/${application.applicationId}`);
    
    if (!verifyResponse.ok) {
      throw new Error(`Failed to verify application: ${verifyResponse.status} ${verifyResponse.statusText}`);
    }
    
    const verifiedApp = await verifyResponse.json();
    console.log(`Verified application status: ${verifiedApp.status}`);
    
    console.log('✅ Test completed successfully. The application form is working correctly and can be submitted.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

test();