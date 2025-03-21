const { ApifyClient } = require('apify-client'),
    ScraperProcessor = require("./ScraperProcessor.js");

const client = new ApifyClient({
    token: 'apify_api_jQGgAStmnh1UKq4FYehlez1w0w9mXi3DNNJ2',
});

const SearchTerms = ["trump crypto", "bitcoin", "solana", "ai agent coin", "memecoin", "elon musk", "crypto", "memecoin", "crypto currency", "blockchain", "trendy coins", "SEC", "wall street", "Trade Wars", "Interest Rates", "Energy", "Inflation,Federal Reserve", "global Environment"]

const Input = {
    "customMapFunction": "(object) => { return {...object} }",
    "includeSearchTerms": false,
    "maxItems": 5,
    "minimumFavorites": 5,
    "minimumReplies": 5,
    "minimumRetweets": 5,
    "onlyImage": false,
    "onlyQuote": false,
    "onlyTwitterBlue": false,
    "onlyVerifiedUsers": false,
    "onlyVideo": false,
    "searchTerms": [
        "solana"
    ],
    "sort": "Latest",
    "start": "2025-01-20",
    "startUrls": [
        
    ],
    "tweetLanguage": "en"
};
async function twitterScraper() {
    let saerchTerm = SearchTerms[Math.floor(Math.random() * SearchTerms.length)]
    Input.searchTerms = [saerchTerm];
    Input.startUrls = [`https://twitter.com/search?q=${saerchTerm}%20&src=typed_query`]
    const run = await client.actor("61RPP7dywgiy0JPD0").call(Input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    await Promise.all(items.map(async (item) => {
        await ScraperProcessor.SaveApifyTwitter(item)
    }));
}

module.exports = {
    TwitterScraper: twitterScraper,
    GetLastTwitter: ScraperProcessor.GetLastTwitter,
    SetSendTwitter: ScraperProcessor.SetSendTwitter
}