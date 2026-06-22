import { NextResponse } from 'next/server';
import { getGoogleSheetsClient, initSheetHeaders, mapSheetRowToModel, REVERSE_MAPPING, getColumnLetter, SPREADSHEET_ID } from '@/lib/googleSheets';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const appId = parseInt(resolvedParams.id, 10);
    const body = await request.json();
    
    const sheets = await getGoogleSheetsClient();
    const sheetName = "Job_Applications";
    const headers = await initSheetHeaders(sheets, sheetName);
    
    const sheetKeyName = REVERSE_MAPPING[sheetName]["id"];
    const keyColIdx = headers.indexOf(sheetKeyName);
    if (keyColIdx === -1) throw new Error("ID column not found");
    
    const colLetter = getColumnLetter(keyColIdx + 1);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!${colLetter}:${colLetter}`,
    });
    
    const colValues = res.data.values || [];
    let rowNum = null;
    for (let i = 0; i < colValues.length; i++) {
      if (parseInt(colValues[i][0], 10) === appId) {
        rowNum = i + 1;
        break;
      }
    }
    
    if (!rowNum) {
      return NextResponse.json({ detail: "Job application not found" }, { status: 404 });
    }
    
    // Get current row
    const lastColLetter = getColumnLetter(headers.length);
    const rowRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A${rowNum}:${lastColLetter}${rowNum}`,
    });
    
    const currentRow = rowRes.data.values ? rowRes.data.values[0] : [];
    const rowDict: Record<string, any> = {};
    for (let i = 0; i < headers.length; i++) {
      rowDict[headers[i]] = currentRow[i] || "";
    }
    
    // Apply updates
    for (const [k, v] of Object.entries(body)) {
      const sheetK = REVERSE_MAPPING[sheetName][k];
      if (sheetK) {
        rowDict[sheetK] = v !== null && v !== undefined ? String(v) : "";
      }
    }
    
    const rowValues = headers.map((h: string) => rowDict[h] || "");
    
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A${rowNum}:${lastColLetter}${rowNum}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowValues] }
    });
    
    return NextResponse.json(mapSheetRowToModel(sheetName, rowDict));
  } catch (error: any) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}
