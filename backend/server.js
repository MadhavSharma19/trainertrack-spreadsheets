require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const XLSX    = require('xlsx');
const path    = require('path');
const fs      = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'trainer-tracker-secret-2024';
const EXCEL_FILE = path.join(__dirname, 'trainer-data.xlsx');

// ─── Excel helpers ────────────────────────────────────────────────────────────

const HEADERS = ['TRAINER NAME', 'DATE', 'SLOT', 'TASK NAME', 'DONE?', 'STATUS', 'REMARKS', 'UPDATED AT'];

/** Load workbook from disk, or create a fresh one with 9 slot sheets */
function loadWorkbook() {
  if (fs.existsSync(EXCEL_FILE)) {
    return XLSX.readFile(EXCEL_FILE);
  }
  const wb = XLSX.utils.book_new();
  for (let i = 1; i <= 9; i++) {
    const ws = XLSX.utils.aoa_to_sheet([HEADERS]);
    XLSX.utils.book_append_sheet(wb, ws, `SLOT ${i}`);
  }
  XLSX.writeFile(wb, EXCEL_FILE);
  console.log(`📄 Created ${EXCEL_FILE}`);
  return wb;
}

/** Ensure all 9 SLOT sheets exist */
function ensureSheets(wb) {
  for (let i = 1; i <= 9; i++) {
    const name = `SLOT ${i}`;
    if (!wb.Sheets[name]) {
      const ws = XLSX.utils.aoa_to_sheet([HEADERS]);
      XLSX.utils.book_append_sheet(wb, ws, name);
    }
  }
}

/**
 * Write/update a slot row in the Excel file.
 * Finds existing row for (trainerName + date + slotNumber) and UPDATES it,
 * or APPENDS a new row. One row per slot per trainer per day.
 */
function saveSlotToExcel({ trainerName, date, slotNumber, taskName, status, remarks }) {
  const wb        = loadWorkbook();
  ensureSheets(wb);

  const sheetName = `SLOT ${slotNumber}`;
  const ws        = wb.Sheets[sheetName];
  const updatedAt = new Date().toISOString();
  const done      = status === 'Done' ? 'YES' : 'NO';

  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  if (rows.length === 0) rows.push(HEADERS);

  let found = false;
  for (let r = 1; r < rows.length; r++) {
    if (
      rows[r][0] === trainerName &&
      rows[r][1] === date &&
      Number(rows[r][2]) === Number(slotNumber)
    ) {
      rows[r] = [trainerName, date, slotNumber, taskName, done, status, remarks, updatedAt];
      found = true;
      break;
    }
  }
  if (!found) {
    rows.push([trainerName, date, slotNumber, taskName, done, status, remarks, updatedAt]);
  }

  wb.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(rows);
  XLSX.writeFile(wb, EXCEL_FILE);
  console.log(`💾 Excel saved → SLOT ${slotNumber} | ${trainerName} | ${date} | ${status}`);
}

/** Read all slots for a trainer+date from Excel */
function readSlotsFromExcel(trainerName, date) {
  if (!fs.existsSync(EXCEL_FILE)) return {};
  const wb     = XLSX.readFile(EXCEL_FILE);
  const result = {};

  for (let i = 1; i <= 9; i++) {
    const ws = wb.Sheets[`SLOT ${i}`];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    for (let r = 1; r < rows.length; r++) {
      if (rows[r][0] === trainerName && rows[r][1] === date && Number(rows[r][2]) === i) {
        result[i] = {
          slotNumber: i,
          taskName:   rows[r][3] || '',
          status:     rows[r][5] || 'Pending',
          remarks:    rows[r][6] || '',
          updatedAt:  rows[r][7] || '',
        };
        break;
      }
    }
  }
  return result;
}

// ─── Users ────────────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, name: 'Admin User',  email: 'admin@company.com',  password: bcrypt.hashSync('admin123',   8), role: 'admin'    },
  { id: 2, name: 'Riya Sharma', email: 'riya@company.com',   password: bcrypt.hashSync('trainer123', 8), role: 'employee' },
  { id: 3, name: 'Arjun Mehta', email: 'arjun@company.com',  password: bcrypt.hashSync('trainer123', 8), role: 'employee' },
  { id: 4, name: 'Priya Singh', email: 'priya@company.com',  password: bcrypt.hashSync('trainer123', 8), role: 'employee' },
  { id: 5, name: 'Vikram Nair', email: 'vikram@company.com', password: bcrypt.hashSync('trainer123', 8), role: 'employee' },
];

// ─── In-memory slot cache (loaded from Excel on first access) ─────────────────
let slotData = {};

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function initTrainerSlots(trainerName, date) {
  if (!slotData[trainerName]) slotData[trainerName] = {};
  if (!slotData[trainerName][date]) {
    // Load persisted data from Excel first — survives server restarts
    const fromExcel = readSlotsFromExcel(trainerName, date);
    slotData[trainerName][date] = {};

    for (let i = 1; i <= 9; i++) {
      slotData[trainerName][date][i] = fromExcel[i] || {
        slotNumber: i,
        taskName:   i === 5 ? 'Lunch Break' : '',
        status:     i === 5 ? 'Break' : 'Pending',
        remarks:    '',
        updatedAt:  new Date().toISOString(),
      };
    }
  }
}

// Startup: init today + create Excel file
USERS.filter(u => u.role === 'employee').forEach(u => initTrainerSlots(u.name, getToday()));
loadWorkbook();

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET, { expiresIn: '8h' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// ─── SLOTS ────────────────────────────────────────────────────────────────────
app.get('/slots', authenticate, (req, res) => {
  const date        = req.query.date || getToday();
  const trainerName = req.user.role === 'admin'
    ? (req.query.trainer || req.user.name)
    : req.user.name;

  initTrainerSlots(trainerName, date);
  const slots = Object.values(slotData[trainerName][date]).sort((a, b) => a.slotNumber - b.slotNumber);
  res.json({ trainer: trainerName, date, slots });
});

app.post('/slots/save', authenticate, (req, res) => {
  const { slotNumber, taskName, status, remarks, date, trainerName: overrideName } = req.body;
  const date_ = date || getToday();
  const name  = (req.user.role === 'admin' && overrideName) ? overrideName : req.user.name;

  initTrainerSlots(name, date_);
  const updatedSlot = { slotNumber, taskName, status, remarks, updatedAt: new Date().toISOString() };
  slotData[name][date_][slotNumber] = updatedSlot;

  // ✅ Auto-save to Excel
  saveSlotToExcel({ trainerName: name, date: date_, slotNumber, taskName, status, remarks });

  res.json({ success: true, slot: updatedSlot });
});

app.put('/slots/update', authenticate, (req, res) => {
  const { slotNumber, taskName, status, remarks, date, trainerName: overrideName } = req.body;
  const date_ = date || getToday();
  const name  = (req.user.role === 'admin' && overrideName) ? overrideName : req.user.name;

  initTrainerSlots(name, date_);
  const existing    = slotData[name][date_][slotNumber] || {};
  const updatedSlot = {
    ...existing, slotNumber,
    taskName:  taskName  ?? existing.taskName,
    status:    status    ?? existing.status,
    remarks:   remarks   ?? existing.remarks,
    updatedAt: new Date().toISOString(),
  };
  slotData[name][date_][slotNumber] = updatedSlot;

  // ✅ Auto-save to Excel
  saveSlotToExcel({ trainerName: name, date: date_, slotNumber, taskName: updatedSlot.taskName, status: updatedSlot.status, remarks: updatedSlot.remarks });

  res.json({ success: true, slot: updatedSlot });
});

// ─── ADMIN ────────────────────────────────────────────────────────────────────
app.get('/admin/trainers', authenticate, adminOnly, (req, res) => {
  const date     = req.query.date || getToday();
  const trainers = USERS.filter(u => u.role === 'employee').map(u => {
    initTrainerSlots(u.name, date);
    const slots      = Object.values(slotData[u.name][date]).sort((a, b) => a.slotNumber - b.slotNumber);
    const done       = slots.filter(s => s.status === 'Done').length;
    const pending    = slots.filter(s => s.status === 'Pending').length;
    const inProgress = slots.filter(s => s.status === 'In Progress').length;
    const delayed    = slots.filter(s => s.status === 'Delayed').length;
    return { id: u.id, name: u.name, email: u.email, slots, done, pending, inProgress, delayed };
  });
  res.json({ date, trainers });
});

app.put('/admin/edit-slot', authenticate, adminOnly, (req, res) => {
  const { trainerName, slotNumber, taskName, status, remarks, date } = req.body;
  const date_ = date || getToday();

  initTrainerSlots(trainerName, date_);
  const existing    = slotData[trainerName][date_][slotNumber] || {};
  const updatedSlot = {
    ...existing, slotNumber,
    taskName:  taskName ?? existing.taskName,
    status:    status   ?? existing.status,
    remarks:   remarks  ?? existing.remarks,
    updatedAt: new Date().toISOString(),
  };
  slotData[trainerName][date_][slotNumber] = updatedSlot;

  // ✅ Auto-save to Excel
  saveSlotToExcel({ trainerName, date: date_, slotNumber, taskName: updatedSlot.taskName, status: updatedSlot.status, remarks: updatedSlot.remarks });

  res.json({ success: true, slot: updatedSlot });
});

app.get('/admin/stats', authenticate, adminOnly, (req, res) => {
  const date     = req.query.date || getToday();
  const trainers = USERS.filter(u => u.role === 'employee');
  let totalDone = 0, totalPending = 0, totalDelayed = 0, totalInProgress = 0;

  trainers.forEach(u => {
    initTrainerSlots(u.name, date);
    Object.values(slotData[u.name][date]).forEach(s => {
      if      (s.status === 'Done')        totalDone++;
      else if (s.status === 'Pending')     totalPending++;
      else if (s.status === 'Delayed')     totalDelayed++;
      else if (s.status === 'In Progress') totalInProgress++;
    });
  });

  res.json({ date, totalTrainers: trainers.length, totalDone, totalPending, totalDelayed, totalInProgress });
});

// ─── Download Excel (admin only) ──────────────────────────────────────────────
app.get('/admin/download-excel', authenticate, adminOnly, (req, res) => {
  if (!fs.existsSync(EXCEL_FILE))
    return res.status(404).json({ error: 'No data file found yet' });
  res.download(EXCEL_FILE, 'trainer-data.xlsx');
});

// ─── Excel info ───────────────────────────────────────────────────────────────
app.get('/sheets/info', authenticate, adminOnly, (req, res) => {
  const exists    = fs.existsSync(EXCEL_FILE);
  let rowCounts   = {};
  if (exists) {
    const wb = XLSX.readFile(EXCEL_FILE);
    for (let i = 1; i <= 9; i++) {
      const ws = wb.Sheets[`SLOT ${i}`];
      if (ws) rowCounts[`SLOT ${i}`] = Math.max(0, XLSX.utils.sheet_to_json(ws, { header: 1 }).length - 1);
    }
  }
  res.json({
    storage: 'Local Excel File (trainer-data.xlsx)',
    file:    EXCEL_FILE,
    exists,
    rowCounts,
    sheetsStructure: {
      sheets:  ['SLOT 1','SLOT 2','SLOT 3','SLOT 4','SLOT 5','SLOT 6','SLOT 7','SLOT 8','SLOT 9'],
      columns: ['TRAINER NAME','DATE','SLOT','TASK NAME','DONE?','STATUS','REMARKS','UPDATED AT'],
    },
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Excel file → ${EXCEL_FILE}`);
});

// ─── Google Sheets Sync ───────────────────────────────────────────────────────
// To enable Google Sheets sync:
// 1. npm install googleapis in backend/
// 2. Create a Google Service Account and share your Sheet with it
// 3. Set GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON in .env
//
// This endpoint syncs all Excel data to a Google Sheet.

app.post('/sheets/sync', authenticate, adminOnly, async (req, res) => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const saJson  = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    if (!sheetId || !saJson) {
      return res.status(400).json({
        error: 'Google Sheets not configured. Set GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON in your backend .env file.',
      });
    }

    // Dynamic import so server starts even without googleapis installed
    let google;
    try {
      google = require('googleapis').google;
    } catch {
      return res.status(500).json({ error: 'googleapis not installed. Run: npm install googleapis in backend/' });
    }

    const credentials = JSON.parse(saJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    if (!fs.existsSync(EXCEL_FILE)) {
      return res.status(404).json({ error: 'No Excel file found yet — save some slots first.' });
    }

    const wb = XLSX.readFile(EXCEL_FILE);
    let totalRows = 0;

    for (let i = 1; i <= 9; i++) {
      const sheetName = `SLOT ${i}`;
      const ws = wb.Sheets[sheetName];
      if (!ws) continue;
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (rows.length <= 1) continue; // only header, skip

      // Ensure the sheet tab exists in Google Sheets
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          resource: {
            requests: [{
              addSheet: { properties: { title: sheetName } }
            }]
          }
        });
      } catch (e) {
        // Sheet already exists — that's fine
      }

      // Write data
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: { values: rows },
      });

      totalRows += rows.length - 1;
    }

    console.log(`🔄 Google Sheets synced — ${totalRows} total rows`);
    res.json({ success: true, message: `Synced ${totalRows} rows to Google Sheets successfully!`, totalRows });

  } catch (err) {
    console.error('Sheets sync error:', err.message);
    res.status(500).json({ error: err.message || 'Sync failed' });
  }
});
