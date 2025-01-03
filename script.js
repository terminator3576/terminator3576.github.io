let pyodide = null;
let files = {};
let currentFile = null;

// Load Pyodide
async function loadPyodideAndSetup() {
    try {
        console.log("Loading Pyodide...");
        pyodide = await loadPyodide();
        console.log("Pyodide loaded successfully.");
        createFile('main.py', true);
        openFile('main.py');
    } catch (err) {
        console.error("Error loading Pyodide:", err);
    }
}

window.onload = loadPyodideAndSetup;

// Create a new file
function createFile(fileName = null, isInitial = false) {
    const fileList = document.getElementById('fileList');
    fileName = fileName || prompt('Enter file name:', `file${Object.keys(files).length + 1}.py`);
    if (!fileName || files[fileName]) return;
    files[fileName] = isInitial ? '# Main Python file' : '';
    const fileItem = document.createElement('li');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `<span onclick="openFile('${fileName}')">${fileName}</span>
                          <button class="menu-button" onclick="deleteFile('${fileName}')">...</button>`;
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
    console.log("Executing Python code:", code);

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
        console.log("Execution output:", output);
        document.getElementById('output').textContent = output;

    } catch (err) {
        // Display any errors
        console.error("Execution error:", err);
        document.getElementById('output').textContent = `Error: ${err.message}`;
    }
}
