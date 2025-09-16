require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 3001;
const path = require("path");


// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

let sheets;
const spreadsheetId = process.env.SHEET_ID;

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
    for (const sheetName of streams) {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: sheetName,
        });
        const rows = response.data.values;
        if (!rows || rows.length < 2) continue;
        const headers = rows[0];
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
              subjectStreams: [sheetName],
              type: 'undergraduate'
            };
            allPrograms.push(program);
          }
        }
      } catch (sheetError) {
        console.warn(`Failed to fetch data from sheet ${sheetName}:`, sheetError.message);
      }
    }
    res.json({ success: true, data: allPrograms });
  } catch (error) {
    console.error('Error fetching degree programs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch degree programs' });
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
    const range = sheetName;

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

    const headers = rows[0];
    console.log(`Detected ${headers.length} columns`);

    const recommendations = [];
    const allQualifyingPrograms = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const programDistrict = row[0];
      for (let j = 1; j < Math.min(headers.length, row.length); j++) {
        const cutoffStr = row[j];
        if (!cutoffStr || cutoffStr === 'NQC') continue;
        const cutoff = parseFloat(cutoffStr);
        if (cutoff > studentZScore) continue;
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
        allQualifyingPrograms.push(program);
        if (program.district?.trim().toLowerCase() === district.trim().toLowerCase()) {
          recommendations.push(program);
        }
      }
    }

    // Nearby recommendations excluding preferred district
    const nearbyDistricts = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara'];
    const nearbyRecommendations = allQualifyingPrograms.filter(p =>
      nearbyDistricts.includes(p.district) && p.district !== district
    ).slice(0, 5);

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


// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
}

// Init function
async function init() {
  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Missing Google API credentials in environment variables');
    }
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    sheets = google.sheets({ version: 'v4', auth });
    console.log("✅ Connected to Google Sheets");
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 University Finder API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error("❌ Failed to initialize:", err.message);
    process.exit(1);
  }
}

init();
