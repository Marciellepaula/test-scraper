const axios = require('axios');
const { JSDOM } = require('jsdom');  

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:105.0) Gecko/20100101 Firefox/105.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36 Edg/103.0.1264.49',
    'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Mobile Safari/537.36',
    'Mozilla/5.0 (Android 10; Mobile; rv:78.0) Gecko/78.0 Firefox/78.0',
    'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36'
];

async function fetchAmazonResults(keyword, retryCount = 0) {
    try {

        const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

        const response = await axios.get(`https://www.amazon.com/s?k=${keyword}`, {
            headers: {
                'User-Agent': userAgent,
            }
        });

        const dom = new JSDOM(response.data);
        const document = dom.window.document;

        const products = [];

 

        const productElements = document.querySelectorAll('.s-asin');

        productElements.forEach((el) => {
            const ratingAndReview = el.querySelector('.a-spacing-top-micro span a span')?.textContent || '';
            const ratingData = ratingAndReview.split('stars');
            const rating = ratingData[0]?.trim().split(' ')[0] || '0';
            const numberOfRatings = el.querySelector('.a-size-small .a-size-base')?.textContent.trim();
        
 
            const product = {
                id: el.getAttribute('data-asin'),
                name: el.querySelector('h2 span')?.textContent || '',
                price_whole: el.querySelector('.a-price-whole')?.textContent || '0',
                price_fraction: el.querySelector('.a-price-fraction')?.textContent || '00',
                rating,
                numberOfRatings,
                image: el.querySelector('.s-image')?.getAttribute('src'),
                link: 'https://www.amazon.com' + el.querySelector('.a-link-normal')?.getAttribute('href'),
            };

            products.push(product);
        });
    
        return { success: true, data: products };

    } catch (error) {
        console.error(error);
        return { success: false, error: 'Error while scraping data.' };
    }
}

module.exports = fetchAmazonResults;
