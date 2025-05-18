// UI Elements
const ui = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    browseButton: document.getElementById('browseBtn'),
    fileInfo: document.getElementById('fileInfo'),
    processButton: document.getElementById('processBtn'),
    progressContainer: document.getElementById('progressContainer'),
    progressBar: document.getElementById('progressBar'),
    progress: document.getElementById('progress'),
    currentFileInfo: document.getElementById('currentFileInfo'),
    progressCount: document.getElementById('progressCount'),
    resultSection: document.getElementById('resultSection'),
    processedFiles: document.getElementById('processedFiles'),
    downloadAllButton: document.getElementById('downloadAllBtn')
};

// Store files and processed data
const selectedFiles = new Set();
const processedFilesData = new Map();

// Standard format headers
const STANDARD_HEADERS = [
    'Date',
    'Transaction Description',
    'Debit',
    'Credit',
    'Currency',
    'CardName',
    'Transaction',
    'Location'
];

// File Upload Handling
function setupFileUpload() {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        ui.dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        ui.dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        ui.dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    ui.dropZone.addEventListener('drop', handleDrop, false);

    // Make the entire drop zone clickable
    ui.dropZone.addEventListener('click', (e) => {
        // Only trigger if not clicking on the Browse Files button itself
        if (!e.target.classList.contains('browse-btn')) {
            ui.fileInput.click();
        }
    });

    // Ensure Browse Files button always works
    ui.browseButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent drop zone click event
        ui.fileInput.click();
    });

    ui.fileInput.addEventListener('change', (e) => handleFileSelection(e.target.files));
    ui.processButton.addEventListener('click', processSelectedFiles);
    ui.downloadAllButton.addEventListener('click', downloadAllFiles);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    ui.dropZone.classList.add('drag-over');
    ui.dropZone.querySelector('.upload-icon').style.transform = 'scale(1.2)';
    ui.dropZone.querySelector('p').textContent = 'Drop files here';
}

function unhighlight(e) {
    ui.dropZone.classList.remove('drag-over');
    ui.dropZone.querySelector('.upload-icon').style.transform = 'scale(1)';
    ui.dropZone.querySelector('p').textContent = 'Drag and drop your CSV or Excel files here';
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = Array.from(dt.files).filter(file => 
        file.type === 'text/csv' || 
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.xls') ||
        file.name.endsWith('.xlsx')
    );
    
    if (files.length > 0) {
        handleFileSelection(files);
        showFileAddedAnimation();
    } else {
        showInvalidFileAnimation();
    }
}

function showFileAddedAnimation() {
    const icon = ui.dropZone.querySelector('.upload-icon');
    icon.textContent = '✓';
    icon.style.color = 'var(--success-color)';
    
    setTimeout(() => {
        icon.textContent = '📁';
        icon.style.color = 'var(--secondary-color)';
    }, 1000);
}

function showInvalidFileAnimation() {
    const icon = ui.dropZone.querySelector('.upload-icon');
    icon.textContent = '✕';
    icon.style.color = 'var(--error-color)';
    
    setTimeout(() => {
        icon.textContent = '📁';
        icon.style.color = 'var(--secondary-color)';
    }, 1000);
}

function handleFileSelection(files) {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
        if (isValidFileType(file)) {
            selectedFiles.add(file);
            showFileAddedAnimation();
        } else {
            showInvalidFileAnimation();
        }
    });
    
    updateFileInfo();
    ui.processButton.disabled = selectedFiles.size === 0;
}

function isValidFileType(file) {
    const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    
    return validTypes.includes(file.type) || 
           validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
}

// File Processing Logic
async function processSelectedFiles() {
    if (selectedFiles.size === 0) return;

    try {
        showProgress();
        ui.processButton.disabled = true;
        
        const files = Array.from(selectedFiles);
        let processed = 0;

        for (const file of files) {
            updateProgress(file.name, processed + 1, files.length);
            
            const content = await readFileContent(file);
            const processedData = await standardizeStatement(content, file.type);
            const outputFileName = createOutputFileName(file.name);
            
            processedFilesData.set(outputFileName, processedData);
            saveProcessedFile(processedData, outputFileName);
            
            processed++;
            updateProgressBar(processed / files.length);
        }

        updateUIAfterProcessing();
        selectedFiles.clear();
        updateFileInfo();
        
        // Show download all button only if multiple files were processed
        ui.downloadAllButton.style.display = files.length > 1 ? 'block' : 'none';
    } catch (error) {
        alert('Error processing files: ' + error.message);
    } finally {
        ui.processButton.disabled = false;
    }
}

async function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                if (file.type === 'text/csv') {
                    resolve(e.target.result);
                } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
                    // Convert Excel to CSV
                    const data = await convertExcelToCSV(e.target.result);
                    resolve(data);
                } else {
                    reject(new Error('Unsupported file format'));
                }
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        
        if (file.type === 'text/csv') {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
}

async function convertExcelToCSV(arrayBuffer) {
    try {
        const workbook = await XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_csv(firstSheet);
    } catch (error) {
        throw new Error('Failed to convert Excel file: ' + error.message);
    }
}

async function standardizeStatement(content, fileType) {
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    const transactions = [];
    let currentSection = 'Domestic';
    let currentUser = 'Rahul';
    let currentTransaction = {};
    let isCollectingTransaction = false;

    // Add standard headers
    transactions.push(STANDARD_HEADERS.join(','));

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const values = line.split(',').map(val => val.trim());

        // Skip header rows and empty lines
        if (isHeaderRow(values[0]) || !values[0]) {
            isCollectingTransaction = false;
            continue;
        }

        // Check for section changes
        if (line.includes('International Transactions')) {
            currentSection = 'International';
            isCollectingTransaction = false;
            continue;
        } else if (line.includes('Domestic Transactions')) {
            currentSection = 'Domestic';
            isCollectingTransaction = false;
            continue;
        }

        // Check for user name rows
        if (isUserNameRow(values[0])) {
            currentUser = values[0];
            isCollectingTransaction = false;
            continue;
        }

        // Start new transaction if date is found
        if (isValidDate(values[0])) {
            if (isCollectingTransaction) {
                // Process previous transaction if exists
                const standardizedLine = processTransaction(currentTransaction, currentUser, currentSection);
                if (standardizedLine) {
                    transactions.push(standardizedLine);
                }
            }
            // Start new transaction
            currentTransaction = {
                date: values[0],
                description: values[1] || '',
                amount: values[2] || '',
                additionalInfo: []
            };
            isCollectingTransaction = true;
        } else if (isCollectingTransaction && values.length > 0) {
            // Add additional information to current transaction
            currentTransaction.additionalInfo.push(line);
        }
    }

    // Process last transaction if exists
    if (isCollectingTransaction) {
        const standardizedLine = processTransaction(currentTransaction, currentUser, currentSection);
        if (standardizedLine) {
            transactions.push(standardizedLine);
        }
    }

    return transactions.join('\n');
}

function processTransaction(transaction, user, section) {
    try {
        // Extract and standardize date
        const date = standardizeDate(transaction.date);
        if (!date) return null;

        // Process description and additional info
        let description = transaction.description;
        transaction.additionalInfo.forEach(info => {
            description += ' ' + info;
        });

        // Extract location
        let location = extractLocation(description);

        // Handle amounts and currency
        let debit = '0.00';
        let credit = '0.00';
        let currency = 'INR';

        // Process amount and currency
        if (transaction.amount) {
            if (transaction.amount.toLowerCase().includes('cr')) {
                credit = standardizeAmount(transaction.amount);
            } else {
                debit = standardizeAmount(transaction.amount);
            }

            // Check for currency in amount
            if (transaction.amount.includes('EUR')) {
                currency = 'EUR';
            } else if (transaction.amount.includes('USD')) {
                currency = 'USD';
            }
        }

        // Check for currency in description
        if (description.includes('EUR')) {
            currency = 'EUR';
            description = description.replace(/EUR/g, '').trim();
        } else if (description.includes('USD')) {
            currency = 'USD';
            description = description.replace(/USD/g, '').trim();
        }

        // Clean up description
        description = cleanDescription(description);

        // Determine transaction type
        const transactionType = determineTransactionType(description, currency, section);

        // Return standardized line
        return [
            date,
            description,
            debit,
            credit,
            currency,
            user,
            transactionType,
            location
        ].join(',');
    } catch (error) {
        console.error('Error processing transaction:', error);
        return null;
    }
}

function isValidDate(dateStr) {
    if (!dateStr) return false;
    
    // Remove any non-date text
    dateStr = dateStr.replace(/[^\d-\/]/g, '');

    const formats = [
        /^(\d{4})-(\d{2})-(\d{2})$/,
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    ];

    return formats.some(format => format.test(dateStr));
}

function cleanDescription(description) {
    // Remove common suffixes and prefixes
    description = description
        .replace(/(PVT LTD|LIMITED|LTD|PRIVATE LIMITED)$/i, '')
        .replace(/^(M\/S|SRS|MSW)[\s*]/i, '')
        .replace(/\s+(CR|DR)$/i, '')
        .trim();

    // Remove currency codes
    description = description
        .replace(/\b(INR|USD|EUR)\b/g, '')
        .trim();

    // Remove location information
    const locationWords = [
        'DELHI', 'MUMBAI', 'BANGALORE', 'GURGAON',
        'NOIDA', 'CHENNAI', 'KATUNAYAKE', 'BERLIN',
        'CALIFORNIA', 'NEWYORK', 'DUSSELDOR'
    ];

    locationWords.forEach(loc => {
        description = description.replace(new RegExp('\\b' + loc + '\\b', 'i'), '');
    });

    // Clean up multiple spaces and special characters
    return description
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s-.,&]/g, '')
        .trim();
}

function isHeaderRow(value) {
    const headerKeywords = ['date', 'description', 'debit', 'credit', 'transaction'];
    return headerKeywords.includes(value.toLowerCase());
}

function isUserNameRow(value) {
    return ['Rahul', 'Ritu', 'Raj'].includes(value);
}

function standardizeDate(dateStr) {
    if (!dateStr) return '';
    
    // Remove any non-date text
    dateStr = dateStr.replace(/[^\d-\/]/g, '');

    const formats = [
        { regex: /^(\d{4})-(\d{2})-(\d{2})$/, groups: [1, 2, 3] },
        { regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, groups: [3, 2, 1] },
        { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, groups: [3, 2, 1] }
    ];

    for (const format of formats) {
        const match = dateStr.match(format.regex);
        if (match) {
            const [_, ...parts] = match;
            const [year, month, day] = format.groups.map(i => parts[i - 1]);
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }

    return dateStr;
}

function standardizeAmount(amount) {
    amount = amount.replace(/[^\d.]/g, '');
    const num = parseFloat(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
}

function extractLocation(description) {
    const locationMap = {
        'DELHI': 'delhi',
        'MUMBAI': 'mumbai',
        'BANGALORE': 'bangalore',
        'GURGAON': 'gurgaon',
        'NOIDA': 'noida',
        'CHENNAI': 'chennai',
        'KATUNAYAKE': 'katunayake',
        'BERLIN': 'berlin',
        'CALIFORNIA': 'california',
        'NEWYORK': 'newyork',
        'DUSSELDOR': 'dusseldor'
    };

    for (const [key, value] of Object.entries(locationMap)) {
        if (description.toUpperCase().includes(key)) {
            return value;
        }
    }

    // Extract last word if it might be a location
    const words = description.split(' ');
    const lastWord = words[words.length - 1];
    if (lastWord && !lastWord.match(/^\d+$/) && !['LTD', 'LIMITED', 'PVT'].includes(lastWord.toUpperCase())) {
        return lastWord.toLowerCase();
    }

    return '';
}

function determineTransactionType(description, currency, section) {
    if (section === 'International') return 'International';

    const internationalKeywords = [
        'SRILANKAN', 'NEWYORK', 'CALIFORNIA', 'BERLIN',
        'DUSSELDOR', 'KATUNAYAKE', 'EUR', 'USD'
    ];

    return (currency !== 'INR' || 
            internationalKeywords.some(keyword => 
                description.toUpperCase().includes(keyword)))
           ? 'International'
           : 'Domestic';
}

// File Handling
function createOutputFileName(inputFileName) {
    const hasInput = /input/i.test(inputFileName);
    if (hasInput) {
        return inputFileName.replace(/input/i, 'output');
    }
    
    const baseName = inputFileName.replace(/\.[^/.]+$/, '');
    return `${baseName}-Output.csv`;
}

// UI Updates
function updateFileInfo() {
    if (selectedFiles.size === 0) {
        ui.fileInfo.style.display = 'none';
        return;
    }

    ui.fileInfo.style.display = 'block';
    const fileList = Array.from(selectedFiles)
        .map(file => {
            const fileIcon = getFileIcon(file);
            return `<li>
                <div class="file-item">
                    <span class="file-icon">${fileIcon}</span>
                    <span class="file-name">${file.name}</span>
                </div>
                <span class="remove-file" data-filename="${file.name}">×</span>
            </li>`;
        })
        .join('');
    
    ui.fileInfo.innerHTML = `
        <h3>Selected Files (${selectedFiles.size}):</h3>
        <ul class="file-list">${fileList}</ul>
    `;

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-file').forEach(button => {
        button.addEventListener('click', (e) => {
            const fileName = e.target.dataset.filename;
            const fileToRemove = Array.from(selectedFiles)
                .find(file => file.name === fileName);
            if (fileToRemove) {
                selectedFiles.delete(fileToRemove);
                updateFileInfo();
                ui.processButton.disabled = selectedFiles.size === 0;
            }
        });
    });
}

function getFileIcon(file) {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        return '📊';
    } else if (file.type.includes('excel') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        return '📈';
    }
    return '📄';
}

function updateProgress(fileName, current, total) {
    ui.currentFileInfo.textContent = `Processing file: ${fileName}`;
    ui.progressCount.textContent = `${current}/${total}`;
}

function updateProgressBar(percentage) {
    ui.progress.style.width = `${percentage * 100}%`;
}

function updateUIAfterProcessing() {
    ui.progressContainer.style.display = 'none';
    ui.resultSection.style.display = 'block';
}

function saveProcessedFile(content, fileName) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const downloadDiv = document.createElement('div');
    downloadDiv.className = 'processed-file';
    downloadDiv.innerHTML = `
        <span>${fileName}</span>
        <a href="${url}" download="${fileName}" class="download-btn">Download</a>
    `;
    
    ui.processedFiles.appendChild(downloadDiv);
    ui.resultSection.style.display = 'block';
}

// ZIP Functionality
async function downloadAllFiles() {
    try {
        const zip = new JSZip();
        
        for (const [fileName, content] of processedFilesData) {
            zip.file(fileName, content);
        }
        
        const zipBlob = await zip.generateAsync({type: 'blob'});
        const downloadUrl = URL.createObjectURL(zipBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = 'processed_statements.zip';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        alert('Error creating ZIP file: ' + error.message);
    }
}

// Add Excel.js library to HTML
function addExcelLibrary() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    document.head.appendChild(script);
}

// Initialize
addExcelLibrary();
setupFileUpload(); 