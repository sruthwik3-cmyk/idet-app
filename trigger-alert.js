
// trigger-alert.js
// This script simulates the frontend making a request to the backend
async function triggerAlert() {
    console.log("Attempting to trigger alert via localhost:3000...");

    try {
        const response = await fetch('http://localhost:3000/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: 'sriperambudururuthwik@gmail.com', // User's email from verify-credentials.js
                subject: 'High Priority Alert Test',
                text: 'This is a test alert directly from the backend trigger script.',
                html: '<h1>Alert Test</h1><p>If you see this, the backend is working!</p>'
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Success! Backend responded:", data);
        } else {
            console.error("Failed! Backend error:", response.status, await response.text());
        }
    } catch (error) {
        console.error("Network error. Is server.js running?", error);
    }
}

triggerAlert();
