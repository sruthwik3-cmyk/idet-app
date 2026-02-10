// Native fetch in Node 18+
async function testEmail() {
    console.log("Testing email sending...");
    try {
        const response = await fetch('http://localhost:3000/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: 'sriperambudururuthwik@gmail.com',
                subject: 'Test Email from Debugger',
                text: 'This is a test email to verify configuration.'
            })
        });

        if (response.ok) {
            console.log("Response OK:", await response.json());
        } else {
            console.log("Response Error:", response.status, await response.text());
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

testEmail();
