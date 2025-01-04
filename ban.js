let userIP = null;

// Fetch the user's IP address from ipify API
fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        // Store the IP address in the variable
        userIP = data.ip;

        // Now you can send the IP address to other JavaScript functions for processing
        console.log('User IP address:', userIP);

        // Example: Call a function to handle the IP
        processUserIP(userIP);
    })
    .catch(error => {
        console.error('Error fetching IP address:', error);
    });

// Function to process the user's IP address (example)
function processUserIP(ip) {
    // Here you can send the IP to your server or take other actions
    // Example: Send the IP to a server using an API request
    console.log('Processing IP address:', ip);

    // Send the IP address to your backend to check if it is banned
    fetch('https://your-backend-server.com/check-ip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip: ip }),
    })
    .then(response => response.json())
    .then(data => {
        // Check if the IP is banned
        if (data.isBanned) {
            // Disable the "Run" button if the IP is banned
            document.getElementById('runButton').disabled = true;

            // Display a message to the user
            document.getElementById('output').textContent = 'Your IP is banned. You cannot run code.';
        } else {
            console.log('IP is not banned');
        }
    })
    .catch(error => {
        console.error('Error checking IP:', error);
        // You can handle errors by assuming the user is not banned
    });
}
