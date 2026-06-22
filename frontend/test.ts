import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

async function test() {
  const credentialsPath = path.resolve(process.cwd(), 'credentials.json');
  console.log("Using credentials:", credentialsPath);
  
  if (!fs.existsSync(credentialsPath)) {
    console.error("File not found!");
    return;
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client as any });

  const spreadsheetId = '1RVWTVDIC32Y3AZF75uOq5AIFpIaJmCtkWrT2ZZI2MXA';
  
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['HELLO! YOUR DATA IS IN THE TAB NAMED "Daily_Progress" AT THE VERY BOTTOM OF THIS SCREEN 👇👇👇']]
      }
    });
    console.log("Message written to A1!");
  } catch (err: any) {
    console.error("Error writing to sheet:", err.message);
  }
}

test();
