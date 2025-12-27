const fs = require('fs');
const apiKey = "AIzaSyCtjnv2UoP-ZekZmYvDKQRBGDpUr53rjd0";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Checking API Key...`);

fetch(url)
    .then(async response => {
        const text = await response.text();
        try {
            const data = JSON.parse(text);
            fs.writeFileSync('models.json', JSON.stringify(data, null, 2));
            console.log("✅ Output written to models.json");
        } catch (e) {
            console.log("❌ Response is not JSON:", text);
        }
    })
    .catch(err => {
        console.error("❌ Fetch error:", err);
    });
