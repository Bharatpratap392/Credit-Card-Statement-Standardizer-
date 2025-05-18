# Credit Card Statement Standardizer

A web-based tool to standardize credit card statements into a uniform CSV format. (And only my input files that are working perfectly fine HDFC & ICICI input files others i tried to fixed but that are not giving desired standard format output)

## Quick Start

1. Double-click `open_readme.bat` to read this documentation in Notepad
2. Double-click `index.html` to start the application in your default web browser

## Features

- Drag and drop or browse to upload CSV files
- Process multiple credit card statement files simultaneously
- Automatic standardization of:
  - Date formats (YYYY-MM-DD)
  - Transaction descriptions
  - Debit/Credit amounts
  - Currency handling
  - Card name assignment
  - Transaction type (Domestic/International)
  - Location extraction
- Individual file downloads for processed statements
- Batch download option (ZIP) automatically available when processing multiple files
- No external dependencies (except JSZip for ZIP functionality)
- Client-side processing (no data leaves your browser)

## Project Structure

```
├── index.html          # Main application page
├── styles.css         # Application styling
├── script.js          # Application logic
├── README.md          # This documentation
├── open_readme.bat    # Batch file to open README in Notepad
└── lib/               # External libraries (JSZip)
```

## Setup Instructions

1. Download and extract all files to a directory of your choice
2. Double-click `index.html` to open the application in your default web browser
3. No additional setup or installation required

## Usage

1. Upload Files:
   - Drag and drop CSV files onto the drop zone, OR
   - Click "Browse Files" to select files using the file browser
2. Click "Process Files" to start conversion
3. Download Options:
   - For single file: Use the individual "Download" button
   - For multiple files: Use the "Download All as ZIP" button (appears automatically when processing multiple files)

## Input Format Requirements

- Files must be in CSV format
- Each transaction should include:
  - Date
  - Transaction description
  - Amount (with CR for credit transactions)
  - Optional: Currency indicators (INR, USD, EUR)

## Output Format

The standardized CSV will contain the following columns:

```csv
Date,Transaction Description,Debit,Credit,Currency,CardName,Transaction,Location
```

Example output:

```csv
2024-03-15,AMAZON RETAIL,1500.00,0.00,INR,Rahul,Domestic,delhi
2024-03-16,STARBUCKS,0.00,25.00,USD,Rahul,International,newyork
```

## Technical Details

- Pure client-side JavaScript implementation
- No data is sent to any server
- JSZip library used for creating ZIP archives when downloading multiple files
- Supports various date formats
- Intelligent location and transaction type detection
- Automatic currency detection and standardization
