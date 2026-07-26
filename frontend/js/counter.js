window.addEventListener('DOMContentLoaded', (event) => {
    getVisitorCount();
});

// For local testing in Codespaces, we will use the forwarded port URL.
// When you deploy to Azure, you will change this to your real Azure Function URL.
const functionApiUrl = 'https://bug-free-waddle-r4p6gvjp5qpvhxwqq-7071.app.github.dev/api/GetVisitorCount'; 

const getVisitorCount = async () => {
    let countElement = document.getElementById('visitor-count');
    
    try {
        const response = await fetch(functionApiUrl);
        const data = await response.json();
        
        // Update the HTML with the new count
        countElement.innerText = data.count;
        console.log("Visitor count updated to: " + data.count);
        
    } catch (error) {
        console.error("Error fetching visitor count:", error);
        countElement.innerText = "System Offline";
    }
}