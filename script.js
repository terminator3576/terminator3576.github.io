// Global variables
let pyodide = null;
let editorInstance = null;
const defaultFileName = "main.py";

// Malicious code checking functions
function logMaliciousActivity() {
    console.warn(`Malicious activity detected`);
}

function isMaliciousCode(code) {
    const dangerousPatterns = [
        /import\s+(os|subprocess|sys|platform)/i, 
        /os\./i, // Checking for system-level commands like os.system()
        /subprocess\./i, // Checking for subprocess usage
        /eval\(/i, // Detecting eval function
        /exec\(/i, // Detecting exec function
        /open\(/i, // Detecting file open functions
        /import\s+socket/i,
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
        editorElement.style.height = "900vh";
        editorInstance = CodeMirror.fromTextArea(editorElement, {
            mode: 'python',
            lineNumbers: true,
            theme: 'material-darker',
            matchBrackets: true,
            autoCloseBrackets: {
                override: true,
                pairs: "()[]{}''\"\"",
                closeBefore: ")]};",
                triples: "",
                explode: "()[]{}",
            },
        });

        // Load content from localStorage or use a default
        const savedCode = localStorage.getItem(defaultFileName) || 'print("Hello world")';
        editorInstance.setValue(savedCode);
        document.getElementById('currentFileName').textContent = `File: ${defaultFileName}`;
    } finally {
        loadingOverlay.classList.remove('visible');
    }
}

window.onload = loadPyodideAndSetup;

// Save code to localStorage
function saveCode() {
    const code = editorInstance.getValue();
    localStorage.setItem(defaultFileName, code);
    alert("Code saved successfully!");
}

// Clear editor
function clearEditor() {
    document.getElementById('currentFileName').textContent = `File: ${defaultFileName}`;
    editorInstance.setValue(''); // Clear editor content
}

// Function to run and manage user-submitted code
async function runCode() {
    try {
        const code = editorInstance.getValue(); // Get the code to execute

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

// Download code as a file
function downloadCode() {
    const code = editorInstance.getValue();

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
    a.download = defaultFileName; 
    document.body.appendChild(a);
    a.click();

    // Clean up the temporary anchor element
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
