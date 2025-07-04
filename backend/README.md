
# University Finder Backend

Backend API for the University Degree Finder application that fetches data from Google Sheets using Google Service Account authentication.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up Google Service Account:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Sheets API
   - Go to "Credentials" → "Create Credentials" → "Service Account"
   - Create a service account and download the JSON key file
   - Share your Google Sheet with the service account email (found in the JSON file)

3. **Prepare your Google Sheet:**
   - Create separate sheets for each subject stream:
     - Physical Science (for Maths stream)
     - Biological Science (for Bio Science stream)
     - Commerce
     - Arts
     - Technology
   - Each sheet should have districts in column A and degree programs in subsequent columns
   - Format: "Degree Name (University Name)"
   - Make sure the sheet is shared with your service account email

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your service account credentials from the JSON file:
   ```
   GOOGLE_PROJECT_ID=your_project_id
   GOOGLE_PRIVATE_KEY_ID=your_private_key_id
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
   GOOGLE_CLIENT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_service_account_email%40your_project.iam.gserviceaccount.com
   GOOGLE_SHEET_ID=your_google_sheet_id
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

5. **Run the server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### GET /api/health
Health check endpoint.

### GET /api/degree-programs
Fetch all degree programs from all subject streams.

### GET /api/recommendations
Get filtered recommendations based on student data.

Query parameters:
- `subjectStream`: Student's subject stream (Maths, Bio Science, Commerce, Arts, Technology)
- `zscore`: Student's Z-score
- `district`: Preferred district

Example:
```
GET /api/recommendations?subjectStream=Maths&zscore=1.8&district=Colombo
```

## Google Sheet Format

Your Google Sheet should have separate sheets for each subject stream with this format:

**Sheet Names:**
- Physical Science (for Maths stream students)
- Biological Science (for Bio Science stream students)  
- Commerce
- Arts
- Technology

**Format for each sheet:**
| District | Engineering (University of Colombo) | Medicine (University of Peradeniya) | ... |
|----------|-------------------------------------|-------------------------------------|-----|
| Colombo  | 1.8543                             | 2.1234                             | ... |
| Kandy    | 1.7234                             | 2.0123                             | ... |

## Notes

- Make sure to share your Google Sheet with the service account email
- The service account must have "Viewer" access to the sheet
- The server runs on port 3001 by default
- CORS is configured to allow requests from your frontend
- Use "NQC" (No Qualified Candidates) for cutoffs where no one qualified
