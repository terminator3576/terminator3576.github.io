// Global variables
let pyodide = null;
let files = {};
let currentFile = null;
const LOCAL_STORAGE_KEY = "savedFiles";

// Load Pyodide and sync files from localStorage
async function loadPyodideAndSetup() {
    document.addEventListener("DOMContentLoaded", () => {
        const fileName = document.getElementById("currentFileName").innerText.replace("File: ", "");
        const savedCode = localStorage.getItem(fileName);

        if (savedCode) {
            document.getElementById("editor").value = savedCode; // Populate the editor with saved code
        }
    });

    // Show the loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('visible');

    try {
        pyodide = await loadPyodide();
        syncFilesWithStorage(); // Ensure files are loaded from localStorage
        if (!Object.keys(files).length) {
            createFile('main.py', true); // Create a default file if no files exist
        }
        openFile(Object.keys(files)[0]); // Open the first file
    } finally {
        // Hide the loading overlay
        loadingOverlay.classList.remove('visible');
    }
}

window.onload = loadPyodideAndSetup;

// Sync files with localStorage
function syncFilesWithStorage() {
    const savedFiles = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
    Object.assign(files, savedFiles);
    updateFileList();
}

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
    files[fileName] = isInitial ? 'print("Hello world")' : '';
    saveFilesToStorage();  // Save the files after creation
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

// Delete a file
function deleteFile(fileName) {
    if (confirm(`Delete "${fileName}"?`)) {
        delete files[fileName];
        saveFilesToStorage();  // Update localStorage after deletion
        updateFileList();
    }
}

// Open a file
function openFile(fileName) {
    if (!files[fileName]) return;
    currentFile = fileName;
    document.getElementById('currentFileName').textContent = `File: ${fileName}`;
    document.getElementById('editor').value = files[fileName];
}

// Function to save the code to local storage
function saveAllFiles() {
    const code = document.getElementById("editor").value; // Get the code from the editor
    const fileName = document.getElementById("currentFileName").innerText.replace("File: ", ""); // Get the current file name

    // Save the code and file name to localStorage
    localStorage.setItem(fileName, code);

    alert(`File "${fileName}" saved to local storage!`);
}

// Save all files to localStorage
function saveFilesToStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(files)); // Save the entire files object to localStorage
}

// Clear editor
function clearEditor() {
    document.getElementById('currentFileName').textContent = 'No file selected';
    document.getElementById('editor').value = '';
    currentFile = null;
}

// Run Python code
async function runCode() {
    const code = document.getElementById('editor').value;

    try {
        // Redirect Python's stdout to a custom buffer
        await pyodide.runPythonAsync(`
            import sys
            from io import StringIO
            sys.stdout = StringIO()  # Redirect stdout
        `);

        // Execute the user's code
        await pyodide.runPythonAsync(code);

        // Get the captured output from the custom buffer
        const output = await pyodide.runPythonAsync(`
            sys.stdout.getvalue()
        `);

        // Display the output
        document.getElementById('output').textContent = output;

    } catch (err) {
        // Display any errors
        console.error("Execution error:", err);
        document.getElementById('output').textContent = `Error: ${err.message}`;
    }
}

// Download the current file
function downloadCode() {
    if (!currentFile) {
        alert("No file selected to download.");
        return;
    }

    const fileName = currentFile; // Get the current file's name
    const code = files[currentFile]; // Get the code content of the current file

    if (!code) {
        alert("The file is empty. Nothing to download.");
        return;
    }

    // Create a blob from the code
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName; // File name with the ".py" extension
    document.body.appendChild(a);
    a.click();

    // Clean up the temporary anchor element
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
