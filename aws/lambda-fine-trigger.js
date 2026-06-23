const https = require('https');

exports.handler = async (event) => {
    // These should be configured in the AWS Lambda Environment Variables
    const API_URL = process.env.API_URL; // e.g., https://your-domain.com/api/fines/trigger-cron
    const API_KEY = process.env.CRON_SECRET_KEY;

    if (!API_URL || !API_KEY) {
        console.error("Missing API_URL or CRON_SECRET_KEY environment variable.");
        return { statusCode: 500, body: 'Configuration error' };
    }

    const options = {
        method: 'POST',
        headers: {
            'x-api-key': API_KEY,
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(API_URL, options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                console.log(`Webhook responded with status ${res.statusCode}:`, data);
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ statusCode: res.statusCode, body: data });
                } else {
                    resolve({ statusCode: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Problem with webhook request: ${e.message}`);
            reject({ statusCode: 500, body: e.message });
        });

        req.end();
    });
};
