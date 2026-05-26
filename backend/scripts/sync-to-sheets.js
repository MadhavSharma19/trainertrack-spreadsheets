/**
 * Google Sheets Sync Script
 * Run: node scripts/sync-to-sheets.js
 * 
 * Setup:
 * 1. Enable Google Sheets API in Google Cloud Console
 * 2. Create a Service Account, download JSON key
 * 3. Share your Sheet with the service account email
 * 4. Set SPREADSHEET_ID and SERVICE_ACCOUNT_KEY_JSON in .env
 */

require('dotenv').config({ path: '../.env' });
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

async function getAuthClient() {
  const keyJson = JSON.parse(process.env.SERVICE_ACCOUNT_KEY_JSON || '{}');
  const auth = new google.auth.GoogleAuth({ credentials: keyJson, scopes: SCOPES });
  return auth.getClient();
}

async function ensureSheets(sheets) {
  const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const existing = res.data.sheets.map(s => s.properties.title);
  const needed = Array.from({ length: 9 }, (_, i) => `SLOT ${i + 1}`);
  const toCreate = needed.filter(n => !existing.includes(n));

  if (toCreate.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: toCreate.map(title => ({
          addSheet: { properties: { title } }
        }))
      }
    });
    console.log(`✅ Created sheets: ${toCreate.join(', ')}`);
  }
}

async function writeHeaders(sheets) {
  const headers = [['TRAINER NAME', 'DATE', 'SLOT', 'TASK NAME', 'DONE?', 'STATUS', 'REMARKS', 'UPDATED AT']];
  for (let i = 1; i <= 9; i++) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `SLOT ${i}!A1:H1`,
      valueInputOption: 'RAW',
      requestBody: { values: headers }
    });
  }
  console.log('✅ Headers written');
}

async function appendSlotData(sheets, rows) {
  // rows: { slot, trainerName, date, taskName, done, status, remarks, updatedAt }
  const bySlot = {};
  rows.forEach(r => {
    if (!bySlot[r.slot]) bySlot[r.slot] = [];
    bySlot[r.slot].push([r.trainerName, r.date, r.slot, r.taskName, r.done ? 'YES' : 'NO', r.status, r.remarks, r.updatedAt]);
  });

  for (const [slot, values] of Object.entries(bySlot)) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `SLOT ${slot}!A:H`,
      valueInputOption: 'RAW',
      requestBody: { values }
    });
  }
  console.log(`✅ Appended ${rows.length} rows`);
}

async function main() {
  if (!SPREADSHEET_ID) {
    console.error('❌ SPREADSHEET_ID not set in .env');
    process.exit(1);
  }

  const auth = await getAuthClient();
  const sheets = google.sheets({ version: 'v4', auth });

  await ensureSheets(sheets);
  await writeHeaders(sheets);

  // Example rows — in production, read from your slotData store or DB
  const exampleRows = [
    { slot: 1, trainerName: 'Riya Sharma', date: new Date().toISOString().split('T')[0], taskName: 'Onboarding Session', done: true, status: 'Done', remarks: 'Completed on time', updatedAt: new Date().toISOString() },
    { slot: 2, trainerName: 'Riya Sharma', date: new Date().toISOString().split('T')[0], taskName: 'React Module', done: false, status: 'In Progress', remarks: '', updatedAt: new Date().toISOString() },
  ];

  await appendSlotData(sheets, exampleRows);
  console.log('🎉 Sync complete!');
}

main().catch(console.error);
