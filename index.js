const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fetchAmazonResults = require('./scraper/fetchAmazon');
const app = express();
const PORT = 3000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);
app.use(cors());

const staticFilesPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(staticFilesPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(staticFilesPath, 'index.html'));
});

app.get('/api/scrape', async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword parameter is required' });
    }

    try {
        const products = await fetchAmazonResults(keyword);
        if (products.length === 0) {
            throw new Error("No products found");
        }
        res.json(products);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
