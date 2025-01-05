// Global variables
let pyodide = null;
let files = {}; // This will hold the code of each file
let currentFile = null;
let editorInstance = null;

// Malicious code checking functions
function logMaliciousActivity() {
    console.warn(`Malicious activity detected`);
}

function isMaliciousCode(code) {
    // Basic malicious code patterns to look for (e.g., system calls, dangerous imports)
    const dangerousPatterns = [
        /import\s+(os|subprocess|sys|platform)/i, // Detecting dangerous imports
        /os\./i, // Checking for system-level commands like os.system()
        /subprocess\./i, // Checking for subprocess usage
        /eval\(/i, // Detecting eval function
        /exec\(/i, // Detecting exec function
        /open\(/i, // Detecting file open functions
        /import\s+socket/i, // Detecting socket imports for remote communication
        /import\s+requests/i // Detecting requests import for HTTP access
    ];

    // Check the code for any dangerous patterns
    for (let pattern of dangerousPatterns) {
        if (pattern.test(code)) {
            return true; // Code is malicious
        }
    }
    return false; // No malicious code detected
}

// Load Pyodide and initialize CodeMirror
async function loadPyodideAndSetup() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('visible');

    try {
        pyodide = await loadPyodide();

        // Initialize CodeMirror
        const editorElement = document.getElementById('editor');
        editorInstance = CodeMirror.fromTextArea(editorElement, {
            mode: 'python',
            lineNumbers: true,
            theme: 'material-darker',
            matchBrackets: true,
            autoCloseBrackets: {
                override: true,
                pairs: "()[]{}''\"\"",
                closeBefore: ")]}:;",
                triples: "",
                explode: "()[]{}",
            },
            extraKeys: {
                "'": function (cm) {
                    const cursor = cm.getCursor();
                    const token = cm.getTokenAt(cursor);

                    if (token.type === "string") {
                        cm.replaceSelection("'", "end");
                    } else {
                        cm.replaceSelection("''");
                        cm.setCursor(cursor.line, cursor.ch + 1);
                    }
                },
                '"': function (cm) {
                    const cursor = cm.getCursor();
                    const token = cm.getTokenAt(cursor);

                    if (token.type === "string") {
                        cm.replaceSelection('"', "end");
                    } else {
                        cm.replaceSelection('""');
                        cm.setCursor(cursor.line, cursor.ch + 1);
                    }
                },
            },
        });

        // Load files from localStorage
        loadFilesFromLocalStorage();

        if (!Object.keys(files).length) {
            createFile('main.py', true);
        }
        openFile(Object.keys(files)[0]);
    } finally {
        loadingOverlay.classList.remove('visible');
    }
}

window.onload = loadPyodideAndSetup;

// Update the file list in the UI
function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    for (const fileName in files) {
        createFileListItem(fileName);
    }
}

// Create a new file
function createFile(fileName = null, isInitial = false) {
    fileName = fileName || prompt('Enter file name:', `file${Object.keys(files).length + 1}.py`);
    if (!fileName || files[fileName]) {
        console.warn(`File creation skipped: ${fileName ? `"${fileName}" already exists.` : "Invalid file name."}`);
        return;
    }
    files[fileName] = isInitial ? 'print("Hello world")' : ''; // Default code or empty
    createFileListItem(fileName);
}

// Create a file list item in the UI
function createFileListItem(fileName) {
    const fileList = document.getElementById('fileList');
    const fileItem = document.createElement('li');
    fileItem.className = 'file-item';

    const fileButton = document.createElement('button');
    fileButton.textContent = fileName;
    fileButton.className = 'file-name';
    fileButton.onclick = () => {
        openFile(fileName); // Open the clicked file
    };

    const deleteButton = document.createElement('button');
    deleteButton.className = 'menu-button';
    deleteButton.textContent = '...';
    deleteButton.onclick = () => deleteFile(fileName);

    fileItem.appendChild(fileButton);
    fileItem.appendChild(deleteButton);
    fileList.appendChild(fileItem);
}

// Save the current file content
function saveCurrentFile() {
    if (!currentFile) return;
    files[currentFile] = editorInstance.getValue();
}

// Save all files to localStorage when save button is clicked
function saveCode() {
    saveCurrentFile(); // Ensure the current file is saved
    localStorage.setItem('files', JSON.stringify(files));
    alert("Code saved successfully!");
}

// Load files from localStorage
function loadFilesFromLocalStorage() {
    const savedFiles = localStorage.getItem('files');
    if (savedFiles) {
        files = JSON.parse(savedFiles);
    }
    updateFileList();
}

// Delete a file
function deleteFile(fileName) {
    if (confirm(`Delete "${fileName}"?`)) {
        delete files[fileName];
        updateFileList();
    }
}

// Open a file
function openFile(fileName) {
    if (!files[fileName]) return;
    currentFile = fileName;
    document.getElementById('currentFileName').textContent = `File: ${fileName}`;
    editorInstance.setValue(files[fileName]);
}

// Clear editor
function clearEditor() {
    document.getElementById('currentFileName').textContent = 'No file selected';
    editorInstance.setValue(''); // Clear editor content
    currentFile = null;
}

// Function to run and manage user-submitted code
async function runCode() {
    try {
        saveCurrentFile(); // Save current file content before execution
        const code = files[currentFile]; // Get the code to execute

        // Check for malicious code
        if (isMaliciousCode(code)) {
            logMaliciousActivity(); // Log the malicious activity
            document.getElementById('output').textContent = "Error: Malicious code detected";
            return; // Stop further execution if malicious code is detected
        }

        // Execute the Python code if it's safe
        await executePythonCode(code);
    } catch (error) {
        console.error("Error in runCode:", error);
        document.getElementById('output').textContent = `Unexpected error: ${error.message}`;
    }
}

// Function to execute Python code safely using Pyodide
async function executePythonCode(code) {
    try {
        await pyodide.runPythonAsync(`
            import sys
            from io import StringIO
            sys.stdout = StringIO()
        `);

        await pyodide.runPythonAsync(code);

        const output = await pyodide.runPythonAsync(`sys.stdout.getvalue()`);
        document.getElementById('output').textContent = output;
    } catch (executionError) {
        console.error("Python execution error:", executionError);
        document.getElementById('output').textContent =
            `Error during execution: ${executionError.message}`;
    } finally {
        await pyodide.runPythonAsync(`sys.stdout = sys.__stdout__`);
    }
}
