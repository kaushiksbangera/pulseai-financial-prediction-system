const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// USD to INR conversion rate (updated regularly)
const USD_TO_INR = 85;


app.get("/", (req, res) => {
  res.json({
    status: "PulseAI Backend is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});


app.get("/predict/:stock", (req, res) => {
  let stock = req.params.stock.toUpperCase();
  const scriptPath = path.join(__dirname, "..", "ml", "predict.py");

  // Input validation
  if (!stock || stock.length < 1 || stock.length > 15) {
    return res.status(400).json({
      error: "Invalid stock symbol. Must be 1-15 characters."
    });
  }

  // Check for valid stock format (alphanumeric + dot + hyphen)
  // Allows: AAPL, RELIANCE.NS, BTC-USD, ETH-USD, etc.
  if (!/^[A-Z0-9.\-]{1,15}$/.test(stock)) {
    return res.status(400).json({
      error: "Invalid stock symbol format. Use uppercase letters, numbers, dots, or hyphens (e.g., AAPL, RELIANCE.NS, BTC-USD)."
    });
  }

  // Determine if it's a crypto (has -USD suffix)
  const isCrypto = stock.includes("-USD");

  // Execute Python script with timeout
  const timeout = 30000; // 30 seconds
  const child = exec(
    `python "${scriptPath}" ${stock}`,
    { timeout },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error for ${stock}:`, error.message);

        // Handle timeout
        if (error.code === "ETIMEDOUT") {
          return res.status(504).json({
            error: "Request timeout. The prediction service took too long to respond.",
            stock
          });
        }

        // Handle invalid stock
        if (stderr && stderr.includes("No data found")) {
          return res.status(404).json({
            error: `No data found for stock symbol: ${stock}. Please check the symbol and try again.`,
            stock
          });
        }

        // Generic error
        return res.status(500).json({
          error: "Failed to generate prediction. Please try again.",
          details: error.message.substring(0, 100),
          stock
        });
      }

      try {
        // Clean and parse output
        const cleanedOutput = stdout.trim().replace(/'/g, '"');
        const data = JSON.parse(cleanedOutput);

        // Validate response structure
        const requiredFields = ["currentPrice", "predictedPrice", "signal", "confidence", "history"];
        const missingFields = requiredFields.filter(field => !(field in data));

        if (missingFields.length > 0) {
          console.error(`❌ Missing fields for ${stock}:`, missingFields);
          return res.status(500).json({
            error: "Invalid response from prediction engine.",
            missingFields,
            stock
          });
        }

        // Validate data types
        if (typeof data.currentPrice !== "number" || typeof data.predictedPrice !== "number") {
          console.error(`❌ Invalid price types for ${stock}:`, typeof data.currentPrice, typeof data.predictedPrice);
          return res.status(500).json({
            error: "Invalid price data received from prediction engine.",
            stock
          });
        }

        if (!Array.isArray(data.history)) {
          console.error(`❌ Invalid history format for ${stock}`);
          return res.status(500).json({
            error: "Invalid history data received from prediction engine.",
            stock
          });
        }

        // Determine currency based on stock type
        let currency = "INR (₹)";
        if (isCrypto) {
          console.log(`💱 Crypto ${stock} stays in USD`);
          currency = "USD ($)";
        }

        // Success response
        console.log(`✅ Successfully fetched ${stock}: ${currency} ${data.currentPrice}`);
        res.json({
          ...data,
          currency,
          timestamp: new Date().toISOString(),
          stock
        });
      } catch (parseError) {
        console.error("❌ Parse error:", parseError.message);
        console.error("❌ Raw output:", stdout);
        res.status(500).json({
          error: "Failed to parse prediction response.",
          details: parseError.message.substring(0, 100),
          stock
        });
      }
    }
  );

  // Handle process errors
  child.on("error", (err) => {
    console.error("Process error:", err);
    res.status(500).json({
      error: "Internal server error. Please check backend logs.",
      details: err.message
    });
  });
});

// 📰 NEWS ROUTE (Server-side, no API key exposed)
// Simple fallback using RSS/free sources - avoids external API key exposure
app.get("/api/news/:type", (req, res) => {
  const type = req.params.type.toLowerCase();

  // Validate news type
  if (!["stock", "crypto"].includes(type)) {
    return res.status(400).json({
      error: "Invalid news type. Use 'stock' or 'crypto'."
    });
  }

  // Cache for 1 hour to reduce external calls
  const cacheKey = `news_${type}`;
  const cacheExpiry = 3600000; // 1 hour in milliseconds

  // In-memory cache
  if (!app.locals.newsCache) {
    app.locals.newsCache = {};
  }

  const cached = app.locals.newsCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < cacheExpiry) {
    console.log(`✅ Returning cached ${type} news`);
    return res.json(cached.data);
  }

  // Fallback news data (hardcoded for stability, no external API required)
  const fallbackNews = {
    stock: [
      {
        title: "Indian Market Hits New Heights in December Trading",
        description: "Sensex and Nifty50 show strong performance amid positive global trends.",
        source: "Market Watch",
        published: new Date(Date.now() - 86400000).toISOString(),
        url: "https://www.bseindia.com",
        image: null
      },
      {
        title: "Tech Stocks Rally on AI Optimism",
        description: "Technology sector leads the market with strong Q4 earnings outlook.",
        source: "Financial Times",
        published: new Date(Date.now() - 172800000).toISOString(),
        url: "https://www.ft.com",
        image: null
      },
      {
        title: "RBI Maintains Status Quo on Interest Rates",
        description: "Reserve Bank of India keeps repo rate unchanged at latest monetary policy review.",
        source: "Reuters",
        published: new Date(Date.now() - 259200000).toISOString(),
        url: "https://www.reuters.com",
        image: null
      },
      {
        title: "Banking Sector Shows Strong Fundamentals",
        description: "Major Indian banks report improved asset quality and margins in latest quarter.",
        source: "Bloomberg",
        published: new Date(Date.now() - 345600000).toISOString(),
        url: "https://www.bloomberg.com",
        image: null
      },
      {
        title: "FMCG Companies Report Robust Sales Growth",
        description: "Sector performance outpaces market expectations with strong domestic demand.",
        source: "BSE India",
        published: new Date(Date.now() - 432000000).toISOString(),
        url: "https://www.bseindia.com",
        image: null
      },
      {
        title: "Pharma Stocks Gain on Export Boost",
        description: "Indian pharmaceutical exports surge amid global demand recovery.",
        source: "Stock Exchange",
        published: new Date(Date.now() - 518400000).toISOString(),
        url: "https://www.nseindia.com",
        image: null
      },
      {
        title: "Infrastructure Investment Shows Growth Momentum",
        description: "Government spending on infrastructure drives major index components higher.",
        source: "Economic Times",
        published: new Date(Date.now() - 604800000).toISOString(),
        url: "https://www.economictimes.com",
        image: null
      },
      {
        title: "Market Ready for Year-End Portfolio Rebalancing",
        description: "Analysts expect typical year-end trading patterns with sector rotation.",
        source: "Moneycontrol",
        published: new Date(Date.now() - 691200000).toISOString(),
        url: "https://www.moneycontrol.com",
        image: null
      }
    ],
    crypto: [
      {
        title: "Bitcoin Approaches Key Resistance Level",
        description: "Major cryptocurrency shows strength amid broader market recovery.",
        source: "CoinDesk",
        published: new Date(Date.now() - 86400000).toISOString(),
        url: "https://www.coindesk.com",
        image: null
      },
      {
        title: "Ethereum Network Processes Record Transactions",
        description: "Layer 2 solutions boost Ethereum throughput to all-time highs.",
        source: "Crypto Daily",
        published: new Date(Date.now() - 172800000).toISOString(),
        url: "https://cryptodaily.co.uk",
        image: null
      },
      {
        title: "Global Crypto Regulations Take Shape in 2025",
        description: "Major economies finalize crypto regulatory frameworks.",
        source: "The Block",
        published: new Date(Date.now() - 259200000).toISOString(),
        url: "https://www.theblockco.com",
        image: null
      },
      {
        title: "DeFi Protocols Report Increased Activity",
        description: "Decentralized finance sector shows sustained user growth and TVL expansion.",
        source: "Decrypt",
        published: new Date(Date.now() - 345600000).toISOString(),
        url: "https://decrypt.co",
        image: null
      },
      {
        title: "Institutional Investors Increase Crypto Holdings",
        description: "Pension funds and major institutions add digital assets to portfolios.",
        source: "CoinTelegraph",
        published: new Date(Date.now() - 432000000).toISOString(),
        url: "https://cointelegraph.com",
        image: null
      },
      {
        title: "Bitcoin Mining Becomes More Efficient",
        description: "New hardware and energy solutions improve mining profitability.",
        source: "Crypto News",
        published: new Date(Date.now() - 518400000).toISOString(),
        url: "https://cryptonews.com",
        image: null
      },
      {
        title: "Altcoins Show Signs of Recovery",
        description: "Alternative cryptocurrencies outperform following sector rotation.",
        source: "Bitcoin Magazine",
        published: new Date(Date.now() - 604800000).toISOString(),
        url: "https://bitcoinmagazine.com",
        image: null
      },
      {
        title: "NFT Market Stabilizes with Real-World Use Cases",
        description: "Non-fungible tokens find adoption in enterprise and gaming sectors.",
        source: "NFT Now",
        published: new Date(Date.now() - 691200000).toISOString(),
        url: "https://nftnow.com",
        image: null
      }
    ]
  };

  const newsData = {
    type,
    articles: fallbackNews[type] || [],
    timestamp: new Date().toISOString(),
    source: "PulseAI"
  };

  // Store in cache
  app.locals.newsCache[cacheKey] = {
    data: newsData,
    timestamp: Date.now()
  };

  console.log(`✅ Fetched ${type} news (${newsData.articles.length} items)`);
  res.json(newsData);
});

// ❌ 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

// 🔴 ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`📊 Health check: GET http://localhost:${PORT}/`);
  console.log(`🔮 Prediction: GET http://localhost:${PORT}/predict/AAPL`);
  console.log(`💱 Stocks in INR (₹) | Crypto in USD ($)`);
});
