window.addEventListener('DOMContentLoaded', () => {
    getVisitorCount();
});

const apiEndpoint = 'https://func-jeysibn-portfolio.azurewebsites.net/api/GetVisitorCount';

const getVisitorCount = async () => {
    const countElement = document.getElementById('visitor-count');

    try {
        const response = await fetch(apiEndpoint);

        if (!response.ok) {
            throw new Error(`Visitor API returned HTTP ${response.status}`);
        }

        const data = await response.json();

        if (typeof data.count !== 'number') {
            throw new Error('Visitor API returned an invalid response');
        }

        countElement.innerText = data.count;
        console.log(`Visitor count updated to: ${data.count}`);
    } catch (error) {
        console.error('Error fetching visitor count:', error);
        countElement.innerText = 'System Offline';
    }
};