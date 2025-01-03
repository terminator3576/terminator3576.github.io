let pyodide = null;
let files = {};
let currentFile = null;

// Load Pyodide
async function loadPyodideAndSetup() {
    // Show the loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('visible');

    try {
        pyodide = await loadPyodide();
        createFile('main.py', true);
        openFile('main.py');
    } finally {
        // Hide the loading overlay
        loadingOverlay.classList.remove('visible');
    }
}

window.onload = loadPyodideAndSetup;

// Create a new file
function createFile(fileName = null, isInitial = false) {
    const fileList = document.getElementById('fileList');
    fileName = fileName || prompt('Enter file name:', `file${Object.keys(files).length + 1}.py`);
    if (!fileName || files[fileName]) {
        console.warn(`File creation skipped: ${fileName ? `"${fileName}" already exists.` : "Invalid file name."}`);
        return;
    }
    files[fileName] = isInitial ? 'print("Hello world")' : '';

    const fileItem = document.createElement('li');
    fileItem.className = 'file-item';

    // Create clickable span or button for the file name
    const fileButton = document.createElement('button');
    fileButton.textContent = fileName;
    fileButton.className = 'file-name';
    fileButton.onclick = () => openFile(fileName); // Attach click event

    const deleteButton = document.createElement('button');
    deleteButton.className = 'menu-button';
    deleteButton.textContent = '...';
    deleteButton.onclick = () => deleteFile(fileName); // Attach delete event

    // Add file name and delete button to the file item
    fileItem.appendChild(fileButton);
    fileItem.appendChild(deleteButton);

    // Add file item to the file list
    fileList.appendChild(fileItem);
}


// Delete a file
function deleteFile(fileName) {
    if (confirm(`Delete "${fileName}"?`)) {
        delete files[fileName];
        if (currentFile === fileName) clearEditor();
        document.getElementById('fileList').innerHTML = '';
        for (let file in files) {
            createFile(file, true);
        }
    }
}


// Open a file
function openFile(fileName) {
    if (!files[fileName]) return;
    currentFile = fileName;
    document.getElementById('currentFileName').textContent = `File: ${fileName}`;
    document.getElementById('editor').value = files[fileName];
}

// Clear editor
function clearEditor() {
    document.getElementById('currentFileName').textContent = 'No file selected';
    document.getElementById('editor').value = '';
    currentFile = null;
}

// Save changes to current file
document.getElementById('editor').addEventListener('input', () => {
    if (currentFile) files[currentFile] = document.getElementById('editor').value;
});

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
