// Initialize tabs
const tabs = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');

// Show selected tab
tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedTab = e.target.getAttribute('data-tab');

        // Hide all tab contents
        tabContents.forEach(content => content.style.display = 'none');
        
        // Show the clicked tab's content
        document.getElementById(selectedTab).style.display = 'block';

        // Initialize CodeMirror if "create-bots" tab is selected
        if (selectedTab === 'create-bots' && !window.codeMirrorInitialized) {
            window.codeMirrorInitialized = true;
            CodeMirror.fromTextArea(document.getElementById('code-editor'), {
                lineNumbers: true,
                mode: "javascript",
                theme: "material",
            }).setSize("100%", "100%");
        }
    });
});
