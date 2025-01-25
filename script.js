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
    });
});

// Initialize bots list (this can be loaded from localStorage or a backend)
const bots = [
    { name: "Bot A", id: "botA" },
    { name: "Bot B", id: "botB" },
    { name: "Bot C", id: "botC" },
    { name: "Bot D", id: "botD" }
];

// Populate bot list
const botList = document.getElementById('bot-list');
bots.forEach(bot => {
    const li = document.createElement('li');
    li.textContent = bot.name;
    li.setAttribute('draggable', 'true');
    li.setAttribute('id', bot.id);
    li.addEventListener('dragstart', drag);
    botList.appendChild(li);
});

// Allow drop functionality
function allowDrop(event) {
    event.preventDefault();
}

// Handle drag event
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

// Handle drop event
function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const bot = document.getElementById(data);
    event.target.appendChild(bot);
}

// Open battle selection modal
document.getElementById('start-battle-btn').addEventListener('click', () => {
    document.getElementById('bot-selection-modal').style.display = 'flex';
});

// Close modal
function closeModal() {
    document.getElementById('bot-selection-modal').style.display = 'none';
}

// Start the battle
function startBattle() {
    const redTeam = document.getElementById('team-red').children;
    const blueTeam = document.getElementById('team-blue').children;

    if (redTeam.length === 0 || blueTeam.length === 0) {
        alert("Please select bots for both teams.");
    } else {
        alert("Starting battle with selected bots!");
        // Implement battle logic here
        closeModal();
    }
}
