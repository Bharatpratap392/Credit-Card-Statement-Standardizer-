# 💳 Credit Card Statement Standardizer

Transform your messy credit card statements into clean, uniform CSV files with this easy-to-use web tool!

---

## 🚀 Quick Start

1.  **Open the Application:** Double-click `index.html` to launch the tool directly in your web browser. No installation needed!

2.  **(Optional) Read Documentation:** Double-click `open_readme.bat` to view this documentation in Notepad.

---

## ✨ Key Features

* **Effortless Upload:** Drag and drop your CSV statement files or use the "Browse Files" option.
    <img src="https://via.placeholder.com/200x50?text=Drag%20&%20Drop" alt="Drag and Drop Example" width="200">

* **Batch Processing:** Handle multiple statements at once, saving you valuable time.
    <img src="https://via.placeholder.com/200x50?text=Process%20Multiple" alt="Multiple Files Example" width="200">

* **Automatic Standardization:** Say goodbye to inconsistent formats! This tool intelligently standardizes:
    * 🗓️ **Date Formats:** Converts to `YYYY-MM-DD`.
    * 📝 **Transaction Descriptions:** Cleans and standardizes descriptions.
    * 💰 **Debit/Credit Amounts:** Separates debits and credits into distinct columns.
    * 🌍 **Currency Handling:** Detects and maintains currency information.
    * 💳 **Card Name Assignment:** Identifies and assigns card names (if possible).
    * 🏷️ **Transaction Type:** Classifies transactions as Domestic or International.
    * 📍 **Location Extraction:** Attempts to extract location details.

* **Flexible Downloads:**
    * ⬇️ **Individual Files:** Download processed statements one by one.
    * 📦 **Batch Download (ZIP):** Automatically get a ZIP archive when processing multiple files.

* **Lightweight & Self-Contained:** Runs entirely in your browser with minimal dependencies (only JSZip for ZIP creation).

* **Privacy Focused:** Your data stays secure! All processing happens directly in your browser, **no data leaves your computer**. 🔒

---

## 📂 Project Structure

├── index.html         # Main application page
├── styles.css         # Application styling (🎨 Look & Feel)
├── script.js          # Application logic (🧠 The Brains)
├── README.md          # This documentation (📖 You are here!)
├── open_readme.bat    # (Windows) Quick way to open README in Notepad
└── lib/               # External libraries
└── JSZip/         # Library for creating ZIP archives

---

## ⚙️ Setup

1.  **Download:** Grab the entire project folder.
2.  **Open:** Double-click `index.html` to start using the application in your web browser. That's it! ✨

---

## 🖱️ How to Use

1.  **📤 Upload Files:**
    * **Drag & Drop:** Simply drag your CSV files onto the designated area.
        <img src="https://via.placeholder.com/150x50?text=Drag%20CSV(s)" alt="Drag CSV Files" width="150">
    * **Browse:** Click the "Browse Files" button to select files using your computer's file explorer.
        <img src="https://via.placeholder.com/150x50?text=Browse%20Files" alt="Browse Files" width="150">

2.  **➡️ Process Files:** Click the "Process Files" button to begin the standardization.
    <img src="https://via.placeholder.com/150x50?text=Process%20Files" alt="Process Files" width="150">

3.  **⬇️ Download Results:**
    * **Single File:** A "Download" button will appear next to each processed file.
        <img src="https://via.placeholder.com/100x30?text=Download" alt="Download Button" width="100">
    * **Multiple Files:** A "Download All as ZIP" button will automatically appear, allowing you to download all processed files in a convenient ZIP archive.
        <img src="https://via.placeholder.com/150x30?text=Download%20ZIP" alt="Download ZIP Button" width="150">

---

## 📄 Input Requirements

* **File Format:** Must be in **CSV (Comma Separated Values)** format.
* **Transaction Data:** Each transaction row should contain:
    * 📅 **Date:** The transaction date.
    * 📝 **Description:** A description of the transaction.
    * 🔢 **Amount:** The transaction amount. Use `CR` to indicate credit transactions (e.g., `100.00 CR`).
    * 🌍 **(Optional) Currency:** Currency indicators like `INR`, `USD`, `EUR`.

---

## 📊 Output Format

The processed and standardized data will be in CSV format with the following consistent columns:

```csv
Date,Transaction Description,Debit,Credit,Currency,CardName,Transaction,Location
