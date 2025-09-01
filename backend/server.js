require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Google Sheets setup with service account
const credentials = require('./credentials');
const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEET_ID;

// Helper function to get sheet name from subject stream
const getSheetNameFromStream = (stream) => {
  const streamMap = {
    'Bio Science': 'BIO',
    'Mathematics': 'Maths',
    'Technology': 'Tech'
  };
  return streamMap[stream] || stream;
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'University Finder API is running',
    timestamp: new Date().toISOString()
  });
});

// Get all degree programs
app.get('/api/degree-programs', async (req, res) => {
  try {
    const allPrograms = [];
    const streams = ['BIO', 'Maths', 'Tech'];

    // Loop through each subject stream (sheet)
    for (const sheetName of streams) {
      const range = `${sheetName}`;

      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });

        const rows = response.data.values;
        if (!rows || rows.length < 2) continue;

        const headers = rows[0];

        // Process each row and create program details
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const district = row[0];

          for (let j = 1; j < headers.length; j++) {
            const cutoffStr = row[j];
            if (!cutoffStr || cutoffStr === 'NQC') continue;

            const header = headers[j];
            const match = header.match(/(.*)\((.*)\)/);
            const degreeName = match?.[1]?.trim() || header;
            const university = match?.[2]?.trim() || "Unknown";

            const program = {
              id: `${sheetName}-${i}-${j}`,
              degreeName,
              subjectStream: sheetName,
              district,
              previousCutoff: parseFloat(cutoffStr),
              university,
              description: `${degreeName} at ${university}`,
              subjectStreams: [sheetName], // Add this for compatibility
              type: 'undergraduate'
            };

            allPrograms.push(program);
          }
        }
      } catch (sheetError) {
        console.warn(`Failed to fetch data from sheet ${sheetName}:`, sheetError.message);
      }
    }

    res.json({
      success: true,
      data: allPrograms
    });
  } catch (error) {
    console.error('Error fetching degree programs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch degree programs'
    });
  }
});

// Get recommendations based on student data
app.get('/api/recommendations', async (req, res) => {
  try {
    const { subjectStream, zscore, district } = req.query;

    if (!subjectStream || !zscore || !district) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: subjectStream, zscore, district'
      });
    }

    const studentZScore = parseFloat(zscore);
    const sheetName = getSheetNameFromStream(subjectStream);
    const range = `${sheetName}`;

    console.log(`Fetching data for ${subjectStream} (${sheetName}) with Z-score ${studentZScore} in ${district}`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return res.status(500).json({
        success: false,
        error: 'Invalid sheet data'
      });
    }

    const headers = rows[3];
    console.log(`Detected ${headers.length} columns`);

    const recommendations = [];
    const allQualifyingPrograms = [];

    // Loop through each row in the sheet
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const programDistrict = row[0];

      for (let j = 1; j < Math.min(headers.length, row.length); j++) {
        const cutoffStr = row[j];
        if (!cutoffStr || cutoffStr === 'NQC') continue;

        const cutoff = parseFloat(cutoffStr);
        if (cutoff > studentZScore) continue; // Skip if student doesn't qualify

        const header = headers[j];
        const match = header.match(/^(.+?)\s*\(([^)]+)\)$/);
        const degreeName = match?.[1]?.trim() || header;
        const university = match?.[2]?.trim() || "Unknown";

        const program = {
          id: `${i}-${j}`,
          degreeName,
          subjectStream,
          district: programDistrict,
          previousCutoff: cutoff,
          university,
          description: `${degreeName} at ${university}`,
          subjectStreams: [subjectStream],
          type: 'undergraduate'
        };

        // Add to all qualifying programs
        allQualifyingPrograms.push(program);

        // Add to main recommendations if in preferred district
        if (program.district?.trim().toLowerCase() === district.trim().toLowerCase()) {
          recommendations.push(program);
        }
      }
    }

    // Get nearby recommendations (excluding preferred district)
    const nearbyDistricts = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara'];
    const nearbyRecommendations = allQualifyingPrograms.filter(p =>
      nearbyDistricts.includes(p.district) && p.district !== district
    ).slice(0, 5); // Limit to 5 nearby recommendations

    console.log(`Found ${recommendations.length} programs in ${district} and ${nearbyRecommendations.length} nearby programs`);

    res.json({
      success: true,
      data: {
        recommendations: recommendations.sort((a, b) => b.previousCutoff - a.previousCutoff),
        nearbyRecommendations: nearbyRecommendations.sort((a, b) => b.previousCutoff - a.previousCutoff),
        totalCount: recommendations.length + nearbyRecommendations.length
      }
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations: ' + error.message
    });
  }
});

// Start server
app.listen(PORT,'0.0.0.0', () => {
  console.log(`🚀 University Finder API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Make sure your .env file has all required Google credentials`);
});
