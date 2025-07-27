const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const visitorsDataFile = path.join(__dirname, 'visitors.json');

app.use(bodyParser.json());
app.use(cors({
    origin: "*"
}));

// Read the visitor data from the static JSON file
const getVisitorData = () => {
    if (fs.existsSync(visitorsDataFile)) {
        const rawData = fs.readFileSync(visitorsDataFile);
        return JSON.parse(rawData);
    } else {
        return { count: 0, visitors: [] };
    }
};

// Write updated visitor data to the JSON file
const saveVisitorData = (data) => {
    fs.writeFileSync(visitorsDataFile, JSON.stringify(data, null, 2));
};

// Route to check if the visitor exists
app.get('/api/check-visitor', (req, res) => {
    const { fingerprint } = req.query;
    const visitorData = getVisitorData();
    const visitorExists = visitorData.visitors.some((visitor) => visitor.fingerprint === fingerprint);
    res.json({ visitorExists });
});

// Route to log a new visitor
app.post('/api/log-visitor', (req, res) => {
    const { fingerprint, date } = req.body;
    const visitorData = getVisitorData();

    if (!visitorData.visitors.some((visitor) => visitor.fingerprint === fingerprint)) {
        // Log the new visitor
        visitorData.visitors.push({ fingerprint, firstVisit: date });
        visitorData.count += 1;

        // Save updated data to the JSON file
        saveVisitorData(visitorData);
        res.status(200).send('Visitor logged successfully');
    } else {
        res.status(400).send('Visitor already exists');
    }
});

// Route to get the current visitor data
app.get('/api/visitor-data', (req, res) => {
    const visitorData = getVisitorData();
    res.json(visitorData);
});

// Serve static files if needed (e.g., front-end)
app.use(express.static('build'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
