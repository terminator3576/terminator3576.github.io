// Global variables
let pyodide = null;
let files = {}; // This will hold the code of each file
let currentFile = null;
let editorInstance = null;

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
    saveFilesToLocalStorage(); // Save files to localStorage after creation
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

// Save the current file content to `localStorage`
function saveCurrentFile() {
    if (!currentFile) return;
    files[currentFile] = editorInstance.getValue();
    saveFilesToLocalStorage(); // Save files to localStorage whenever a file is saved or edited
}

// Save all files to localStorage
function saveFilesToLocalStorage() {
    localStorage.setItem('files', JSON.stringify(files));
}

// Load files from localStorage
function loadFilesFromLocalStorage() {
    const savedFiles = localStorage.getItem('files');
    if (savedFiles) {
        files = JSON.parse(savedFiles);
    }
}

// Delete a file
function deleteFile(fileName) {
    if (confirm(`Delete "${fileName}"?`)) {
        delete files[fileName];
        updateFileList();
        saveFilesToLocalStorage(); // Save updated files list to localStorage
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
    // Save current file content before execution (assuming `saveCurrentFile()` is defined elsewhere)
    saveCurrentFile();
    const code = files[currentFile];  // Assuming `files[currentFile]` holds the code to execute

    // Check for malicious code
    if (isMaliciousCode(code)) {
      logMaliciousActivity();  // Log the malicious activity
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
