# ⚡ TrainerTrack — Slot-wise Trainer Management System

A full-stack web application for managing daily trainer schedules with admin oversight and Google Sheets integration.

---

## 🏗️ Tech Stack

| Layer      | Technology                              |
|------------|----------------------------------------|
| Frontend   | React 18, React Router 6, Axios        |
| Backend    | Node.js, Express.js                    |
| Auth       | JWT (jsonwebtoken) + bcryptjs          |
| Database   | In-memory (Google Sheets via API)      |
| Sheets     | Google Sheets API v4 (googleapis)      |

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env        # edit JWT_SECRET at minimum
npm install
node server.js              # starts on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start                   # starts on http://localhost:3000
```

---

## 🔐 Demo Accounts

| Role     | Email                  | Password     |
|----------|------------------------|--------------|
| Admin    | admin@company.com      | admin123     |
| Trainer  | riya@company.com       | trainer123   |
| Trainer  | arjun@company.com      | trainer123   |
| Trainer  | priya@company.com      | trainer123   |
| Trainer  | vikram@company.com     | trainer123   |

---

## 📋 Features

### Employee (Trainer) Dashboard
- View all 9 daily slots (Slot 1–9, Slot 5 = Break)
- Edit task name, status, and remarks per slot
- Track today's progress with a visual progress bar
- KPI cards: Done / In Progress / Pending / Delayed
- View historical dates via date picker

### Admin Dashboard
- Overview: total stats across all trainers
- Per-trainer breakdown with expandable slot view
- Edit any trainer's slot directly (override)
- Trainer Schedules page with full slot editing
- Google Sheets integration info + setup guide

### Authentication
- JWT-based login (8h expiry)
- Role-based routing (admin → /admin, employee → /dashboard)
- Protected routes with redirect logic

---

## 📊 Google Sheets Integration

### Setup Steps

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Google Sheets API**
3. Create a **Service Account** → Download JSON key
4. Share your Google Sheet with the service account email (Editor access)
5. Add to `backend/.env`:

```env
SPREADSHEET_ID=your-spreadsheet-id
SERVICE_ACCOUNT_KEY_JSON={"type":"service_account","project_id":"..."}
```

6. Run the sync script:

```bash
cd backend
node scripts/sync-to-sheets.js
```

### Sheet Structure

9 sheets named **SLOT 1** through **SLOT 9**, each with columns:

| TRAINER NAME | DATE | SLOT | TASK NAME | DONE? | STATUS | REMARKS | UPDATED AT |

---

## 🗂️ API Reference

### Auth
```
POST /login          { email, password } → { token, user }
```

### Slots (Employee)
```
GET  /slots          ?date=YYYY-MM-DD    → { trainer, date, slots[] }
POST /slots/save     { slotNumber, taskName, status, remarks, date }
PUT  /slots/update   { slotNumber, taskName, status, remarks, date }
```

### Admin
```
GET  /admin/trainers  ?date=YYYY-MM-DD  → { trainers[] with slots }
GET  /admin/stats     ?date=YYYY-MM-DD  → { totals }
PUT  /admin/edit-slot { trainerName, slotNumber, taskName, status, remarks, date }
GET  /sheets/info                       → setup instructions
```

---

## 🎨 UI Design

- **Theme**: Dark navy (#0a0e1a) with blue accents (#3b82f6)
- **Font**: DM Sans (Google Fonts)
- **Layout**: Collapsible sidebar + main content area
- **Components**: KPI cards, slot cards with status stripes, progress bars, expandable trainer rows, edit modals

---

## 📁 Project Structure

```
trainer-tracker/
├── backend/
│   ├── server.js              # Express API + in-memory store
│   ├── scripts/
│   │   └── sync-to-sheets.js  # Google Sheets export script
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── context/AuthContext.js
    │   ├── components/
    │   │   ├── Sidebar.js
    │   │   └── SlotCard.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Dashboard.js        # Employee view
    │   │   ├── AdminDashboard.js   # Admin overview
    │   │   ├── AdminTrainers.js    # Trainer schedules
    │   │   └── SheetsPage.js       # Sheets setup guide
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 🔧 Production Notes

- Replace in-memory `slotData` with a real DB (PostgreSQL, MongoDB) or persist to Google Sheets directly
- Add trainer management (CRUD) via admin panel
- Add date-range analytics and export
- Set `JWT_SECRET` to a strong random string in production
- Use HTTPS + secure cookie storage for tokens
