import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];

export async function getGoogleSheetsClient() {
  let credentials;
  
  // Vercel deployment: read from direct JSON string env var
  if (process.env.GOOGLE_SHEETS_CREDENTIALS_JSON) {
    credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS_JSON);
  } else {
    // Local development: read from file
    const credentialsPath = process.env.GOOGLE_SHEETS_CREDENTIALS_PATH || './credentials.json';
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`Credentials file not found at ${credentialsPath} and GOOGLE_SHEETS_CREDENTIALS_JSON env var is not set.`);
    }
    credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client as any });

  return sheets;
}

export const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || "1RVWTVDIC32Y3AZF75uOq5AIFpIaJmCtkWrT2ZZI2MXA";

// Define headers mapping for each sheet (matching Python backend)
export const HEADER_MAPPINGS: Record<string, Record<string, string>> = {
  "Daily_Progress": {
    "Date": "date", "Study_Hours": "study_hours", "Technology": "technology",
    "Topics_Covered": "topics_covered", "DSA_Count": "dsa_count", "DSA_Topic": "dsa_topic",
    "Leetcode_Links": "leetcode_links", "Interview_Prep": "interview_prep",
    "Projects": "projects", "Notes": "notes", "Planned_DSA": "planned_dsa",
    "Planned_Dev": "planned_dev", "Planned_SysDesign": "planned_sys_design",
    "Daily_Score": "daily_score"
  },
  "Job_Applications": {
    "ID": "id", "Company": "company", "Role": "role", "Location": "location",
    "Source": "source", "Applied_Date": "applied_date", "Status": "status",
    "Salary": "salary", "Job_Link": "job_link", "Notes": "notes", "Resume_Version": "resume_version"
  },
  "DSA_Tracker": {
    "ID": "id", "Date": "date", "Problem": "problem", "Platform": "platform",
    "Difficulty": "difficulty", "Topic": "topic", "Status": "status", "Time_Taken": "time_taken"
  },
  "Interview_Tracker": {
    "ID": "id", "Company": "company", "Round": "round", "Date": "date",
    "Type": "type", "Result": "result", "Feedback": "feedback"
  },
  "System_Design_Tracker": {
    "ID": "id", "Topic": "topic", "Status": "status", "Revision_Count": "revision_count",
    "Notes": "notes"
  },
  "Bulk_Applications": {
    "Date": "date", "Count": "count"
  },
  "Interview_Questions": {
    "ID": "id", "Question": "question", "Category": "category", "Answer": "answer",
    "Confidence_Level": "confidence_level"
  },
  "Resumes": {
    "ID": "id", "Version": "version", "Target_Role": "target_role", "Date_Created": "date_created",
    "Used_For": "used_for", "Result": "result"
  }
};

export const REVERSE_MAPPING: Record<string, Record<string, string>> = {};
for (const [sheet, fields] of Object.entries(HEADER_MAPPINGS)) {
  REVERSE_MAPPING[sheet] = {};
  for (const [k, v] of Object.entries(fields)) {
    REVERSE_MAPPING[sheet][v] = k;
  }
}

export function mapSheetRowToModel(sheetName: string, rowDict: Record<string, any>): Record<string, any> {
  const mapping = HEADER_MAPPINGS[sheetName] || {};
  const modelDict: Record<string, any> = {};
  
  for (const [sheetKey, modelKey] of Object.entries(mapping)) {
    let val = rowDict[sheetKey] !== undefined ? rowDict[sheetKey] : "";
    
    if (val === "") {
      const nullables = ["location", "source", "salary", "job_link", "notes", "resume_version", "feedback", "used_for", "result", "technology", "topics_covered", "dsa_topic", "leetcode_links", "interview_prep", "projects", "planned_dev", "planned_sys_design"];
      val = nullables.includes(modelKey) ? null : "";
    }
    
    if (["id", "dsa_count", "planned_dsa", "revision_count", "time_taken", "daily_score"].includes(modelKey)) {
      val = val ? parseInt(val, 10) : 0;
      if (isNaN(val)) val = 0;
    } else if (["study_hours"].includes(modelKey)) {
      val = val ? parseFloat(val) : 0.0;
      if (isNaN(val)) val = 0.0;
    }
    
    modelDict[modelKey] = val;
  }
  return modelDict;
}

export function mapModelToSheetRow(sheetName: string, modelDict: Record<string, any>): Record<string, any> {
  const mapping = REVERSE_MAPPING[sheetName] || {};
  const sheetRow: Record<string, any> = {};
  
  for (const [modelKey, sheetKey] of Object.entries(mapping)) {
    const val = modelDict[modelKey];
    sheetRow[sheetKey] = val !== null && val !== undefined ? String(val) : "";
  }
  return sheetRow;
}

export async function initSheetHeaders(sheets: any, sheetName: string) {
  const ss = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetExists = ss.data.sheets?.find((s: any) => s.properties?.title === sheetName);

  if (!sheetExists) {
    const mapping = HEADER_MAPPINGS[sheetName] || {};
    const headers = Object.keys(mapping);
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              }
            }
          }
        ]
      }
    });
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });
    
    return headers;
  } else {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:Z1`,
    });
    return res.data.values ? res.data.values[0] : null;
  }
}

export async function readRowsFromSheet(sheetName: string) {
  const sheets = await getGoogleSheetsClient();
  const headers = await initSheetHeaders(sheets, sheetName);
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}`,
  });
  
  const rows = res.data.values || [];
  if (rows.length <= 1) return []; // Only headers or empty
  
  const actualHeaders = rows[0];
  const records = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowDict: Record<string, any> = {};
    for (let j = 0; j < actualHeaders.length; j++) {
      rowDict[actualHeaders[j]] = row[j] || "";
    }
    records.push(mapSheetRowToModel(sheetName, rowDict));
  }
  
  return records;
}

export async function getNextId(sheetName: string) {
  const sheets = await getGoogleSheetsClient();
  await initSheetHeaders(sheets, sheetName);
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A:A`, // Assuming ID is always column A
  });
  
  const values = res.data.values || [];
  if (values.length <= 1) return 1;
  
  const ids = values.slice(1).map((row: any) => parseInt(row[0], 10)).filter((n: number) => !isNaN(n));
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

function getColumnLetter(colIdx: number) {
  let result = "";
  while (colIdx > 0) {
    let remainder = (colIdx - 1) % 26;
    colIdx = Math.floor((colIdx - 1) / 26);
    result = String.fromCharCode(65 + remainder) + result;
  }
  return result;
}

export async function upsertRowInSheet(sheetName: string, keyColName: string, keyVal: any, rowData: Record<string, any>) {
  const sheets = await getGoogleSheetsClient();
  const headers = await initSheetHeaders(sheets, sheetName);
  
  const sheetRow = mapModelToSheetRow(sheetName, rowData);
  const sheetKeyName = REVERSE_MAPPING[sheetName][keyColName];
  sheetRow[sheetKeyName] = String(keyVal);
  
  const rowValues = headers.map((h: string) => sheetRow[h] || "");
  const keyColIdx = headers.indexOf(sheetKeyName);
  
  if (keyColIdx === -1) throw new Error(`Key column ${sheetKeyName} not found in headers`);
  
  const colLetter = getColumnLetter(keyColIdx + 1);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!${colLetter}:${colLetter}`,
  });
  
  const colValues = res.data.values || [];
  let rowNum = null;
  
  for (let i = 0; i < colValues.length; i++) {
    if (String(colValues[i][0]) === String(keyVal)) {
      rowNum = i + 1;
      break;
    }
  }
  
  const lastColLetter = getColumnLetter(headers.length);
  
  if (rowNum) {
    // Update
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A${rowNum}:${lastColLetter}${rowNum}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowValues] }
    });
  } else {
    // Append
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'OVERWRITE',
      requestBody: { values: [rowValues] }
    });
  }
  
  return rowData;
}
