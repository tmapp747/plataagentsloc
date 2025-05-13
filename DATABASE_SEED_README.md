# Database Seeding Instructions

This folder contains files to help you seed the database with application data.

## Files

1. `application_template.md` - A template you can use to create new applications
2. `sample_application.json` - A sample application in JSON format
3. `seed_database.js` - A script to seed the database with application data

## Seeding Process

### 1. Create Application Data

You can edit the `sample_application.json` file or create new JSON files based on the template in `application_template.md`. You can create a single application object or an array of application objects.

### 2. Run the Seed Script

To seed the database with your application data, run:

```bash
node seed_database.js sample_application.json
```

Or with your custom JSON file:

```bash
node seed_database.js path/to/your/data.json
```

### 3. Verify the Data

After seeding, you can verify the data was properly inserted by checking the application in the PlataPay admin panel.

## Field Descriptions

- **Personal Information** - Basic information about the applicant
- **Background Check** - Criminal and financial background information
- **Business Experience** - Information about the applicant's business experience
- **Address Details** - Home and business location information
- **Package Selection** - The PlataPay package selected by the applicant
- **Application Status** - The current status of the application

## Notes

- You don't need to provide `applicationId` or `resumeToken` - they will be generated automatically if not provided
- Dates should be in ISO format (YYYY-MM-DD)
- Address and business location objects will be automatically converted to JSON strings in the database
- You can seed multiple applications by providing an array of application objects in your JSON file