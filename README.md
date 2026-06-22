# Job Switch Preparation Dashboard

A modern, responsive, glassmorphism-style transition dashboard built specifically for a Full Stack Developer preparing for a software engineering job switch in the next 4–5 months, targeting a ₹12–15 LPA salary bracket. 

## Features

- **Outcome KPI Dashboard**: Target outcome indicators at the top (150+ Applications, 50+ OA, 30+ Interviews, 3+ Offers, 500+ DSA questions, 30 System Design topics, 20 Mocks).
- **Gamified Daily score**: Capped out of 100 points, computed based on your daily DSA solved (40%), development learning (30%), job applications (20%), and system design revision (10%).
- **Interactive Kanban Pipeline**: Drag/move companies between stages (`Applied` → `OA Received` → `Interview` → `Offer` or `Rejected`) with quick action shortcuts.
- **Direct-to-Sheets API Database**: Bypasses any SQLite or SQL configurations. All CRUD operations (creating, editing, deleting) read and write to your Google Sheets worksheets directly in real-time.
- **Weekly & Monthly Recharts Analytics**: High-quality visual trends of study hours, DSA, and application count.
- **System Design & Interview Questions**: Accordions and confidence checks for flashcard preparation.
- **Resume variant history checklist**: Tracks which resume version (e.g. Full Stack Generalist vs Backend focus) was used for each company.
- **CSV Data Exporter**: Click to download all job applications directly to standard CSV format.
- **AI Motivational Coach Heuristics**: Custom motivational summary generated using Gemini API (if key is present) or dynamic rule-based metrics evaluation.
- **Access Password Shield**: Simple front-end unlock screen based on your environment password value.

---

## Tech Stack

**Frontend**:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS (Glassmorphic panels and borders)
- Recharts (Interactive visualization charts)
- Lucide React (Icons)

**Backend**:
- FastAPI
- Google Sheets API Integration (via `gspread`)

---

## Getting Started

### 1. Prerequisite Packages
Install Python 3.10+ and Node.js 18+.

---

### 2. Google Sheets API Integration

To enable backend database connections to Google Sheets:
1. Copy the downloaded Service Account credentials JSON key content you generated inside Google Cloud Console.
2. Create a file named `credentials.json` inside the `backend/` directory and paste the JSON content inside it.
3. Share your target Google Sheet spreadsheet in Google Drive with the service account email:
   `job-switch-tracker@whatsapp-automation-498717.iam.gserviceaccount.com`
   giving it **Editor** permissions.
4. Copy the Spreadsheet ID from the URL of your Google Sheet (the long string between `/d/` and `/edit`):
   `1RVWTVDIC32Y3AZF75uOq5AIFpIaJmCtkWrT2ZZI2MXA`
5. Configure `backend/.env` with:
   ```env
   GOOGLE_SHEETS_CREDENTIALS_PATH=credentials.json
   GOOGLE_SPREADSHEET_ID=1RVWTVDIC32Y3AZF75uOq5AIFpIaJmCtkWrT2ZZI2MXA
   DASHBOARD_PASSWORD=switch2026
   ```

---

### 3. Backend Setup (FastAPI)

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   python run.py
   ```
   *The API will be available at `http://localhost:8000`. On startup, it will automatically connect to your Google Sheet spreadsheet and initialize the worksheet tables: `Daily_Progress`, `Job_Applications`, `DSA_Tracker`, `Interview_Tracker`, `System_Design_Tracker`, `Interview_Questions`, and `Resumes`.*

---

### 4. Frontend Setup (Next.js 15)

1. Navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install npm node modules:
   ```bash
   npm install
   ```
3. Copy `.env.local` to configure parameters:
   - `NEXT_PUBLIC_API_URL` defaults to `http://localhost:8000`.
   - `NEXT_PUBLIC_DASHBOARD_PASSWORD` defaults to `switch2026`.
4. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   *The application will boot at `http://localhost:3000`.*
5. Enter the password `switch2026` to unlock the dashboard. Click the red **Clear & Start Fresh** button to make sure any previous mock sheets data is wiped and start tracking!
