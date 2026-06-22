import gspread
from google.oauth2.service_account import Credentials
import sys

def test():
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]
    try:
        creds = Credentials.from_service_account_file('credentials.json', scopes=scopes)
        client = gspread.authorize(creds)
        spreadsheet_id = "1RVWTVDIC32Y3AZF75uOq5AIFpIaJmCtkWrT2ZZI2MXA"
        sh = client.open_by_key(spreadsheet_id)
        print("Success! Title:", sh.title)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test()
