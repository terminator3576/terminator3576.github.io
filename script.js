// Global variables
let pyodide = null;
let files = {}; // This will hold the code of each file
let currentFile = null;
let editorInstance = null;


function warnUser() {
    console.warn(`You have been banned for submitting malicious code.`);
}

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

function saveCurrentFile() {
    if (!currentFile) return;
    files[currentFile] = editorInstance.getValue();
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

import { set, ref, child, get } from "firebase/database"; // Import Firebase functions

// Function to ban an IP address
export async function banIP(ip) {
  try {
    await set(ref(database, `bannedIPs/${ip}`), true);
    console.log(`IP ${ip} has been successfully banned.`);
  } catch (error) {
    console.error(`Error banning IP (${ip}):`, error);
  }
}

// Function to check if an IP is already banned
export async function isIPBanned(ip) {
  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `bannedIPs/${ip}`));
    return snapshot.exists();
  } catch (error) {
    console.error(`Error checking if IP (${ip}) is banned:`, error);
    return false; // Default to not banned on error
  }
}

// Helper function to fetch user's IP address dynamically
async function getUserIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Failed to fetch user's IP address:", error);
    return null; // Return null if unable to fetch IP
  }
}

// Function to run and manage user-submitted code
async function runCode() {
  try {
    // Save current file content before execution
    saveCurrentFile();
    const code = files[currentFile];

    // Check for malicious code
    if (isMaliciousCode(code)) {
      logMaliciousActivity(); // Log the malicious activity
      warnUser(); // Notify the user

      document.getElementById('output').textContent =
        "Error: Malicious code detected. Your IP has been banned.";

      // Attempt to ban the user's IP
      try {
        const userIP = await getUserIP();
        if (userIP) {
          await banIP(userIP);
          console.log(`IP ${userIP} has been banned due to malicious activity.`);
        } else {
          console.warn("Could not retrieve user's IP for banning.");
        }
      } catch (banError) {
        console.error("Failed to ban user's IP:", banError);
      }

      return; // Stop further execution if code is malicious
    }

    // Run the user-submitted code using Pyodide
    await executePythonCode(code);
  } catch (error) {
    console.error("Error in runCode:", error);
    document.getElementById('output').textContent =
      `Unexpected error: ${error.message}`;
  }
}

// Function to execute Python code safely using Pyodide
async function executePythonCode(code) {
  try {
    // Initialize stdout redirection in Pyodide
    await pyodide.runPythonAsync(`
      import sys
      from io import StringIO
      sys.stdout = StringIO()
    `);

    // Execute the Python code
    await pyodide.runPythonAsync(code);

    // Capture and display the output
    const output = await pyodide.runPythonAsync(`sys.stdout.getvalue()`);
    document.getElementById('output').textContent = output;
  } catch (executionError) {
    // Handle Python code execution errors
    console.error("Python execution error:", executionError);
    document.getElementById('output').textContent =
      `Error during execution: ${executionError.message}`;
  } finally {
    // Reset stdout back to default
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

// Add a new function to format the code using autopep8
async function formatCode() {
    if (!currentFile) return;

    const code = editorInstance.getValue();

    try {
        // Ensure the autopep8 package is loaded before formatting
        await pyodide.loadPackage('micropip');
        await pyodide.runPythonAsync(`
            import micropip
            await micropip.install("autopep8")
        `);

        // Use Pyodide to run the autopep8 formatting
        const formattedCode = await pyodide.runPythonAsync(`
            import autopep8
            formatted_code = autopep8.fix_code(${JSON.stringify(code)})
            formatted_code
        `);

        // Update the editor with the formatted code
        editorInstance.setValue(formattedCode);
    } catch (err) {
        console.error("Formatting error:", err);
        document.getElementById('output').textContent = `Error formatting code: ${err.message}`;
    }
}

// Add a "Format Code" button to the UI
document.addEventListener('DOMContentLoaded', function() {
    const formatButton = document.createElement('button');
    formatButton.textContent = 'Format Code';
    formatButton.onclick = formatCode;

    const editorPanel = document.querySelector('.editor-panel');
    editorPanel.appendChild(formatButton);
});
