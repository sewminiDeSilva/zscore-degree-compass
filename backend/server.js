require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

let sheets;
const spreadsheetId = process.env.SHEET_ID;

// Helper function to map stream names to sheets
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
      const range = `${sheetName}`;
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
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
            allPrograms.push({
              id: `${sheetName}-${i}-${j}`,
              degreeName,
              subjectStream: sheetName,
              district,
              previousCutoff: parseFloat(cutoffStr),
              university,
              description: `${degreeName} at ${university}`,
              subjectStreams: [sheetName],
              type: 'undergraduate'
            });
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
      return res.status(400).json({ success: false, error: 'Missing required parameters: subjectStream, zscore, district' });
    }
    const studentZScore = parseFloat(zscore);
    const sheetName = getSheetNameFromStream(subjectStream);
    const range = `${sheetName}`;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const rows = response.data.values;
    if (!rows || rows.length < 2) {
      return res.status(500).json({ success: false, error: 'Invalid sheet data' });
    }
    const headers = rows[3];
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

    const nearbyDistricts = ['Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara'];
    const nearbyRecommendations = allQualifyingPrograms.filter(p =>
      nearbyDistricts.includes(p.district) && p.district !== district
    ).slice(0, 5);

    res.json({
      success
