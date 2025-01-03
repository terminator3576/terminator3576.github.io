let pyodide = null;
let files = {};
let currentFile = null;

// Load Pyodide
async function loadPyodideAndSetup() {
    pyodide = await loadPyodide();
    console.log('Pyodide loaded');
    createFile('main.py', true);
    openFile('main.py');
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
    try {
        const result = await pyodide.runPythonAsync(code);
        document.getElementById('output').textContent = result;
    } catch (err) {
        document.getElementById('output').textContent = `Error: ${err}`;
    }
}
