import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import TopCards from "./components/TopCards";
import PriceChart from "./components/PriceChart";
import SignalCard from "./components/SignalCard";
import NewsDashboard from "./components/NewsDashboard";
import InvestmentCalculator from "./components/InvestmentCalculator";
import "./styles.css";

const API_URL = "http://localhost:5000/predict";

export default function App() {
  const [stock, setStock] = useState("RELIANCE.NS");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showNews, setShowNews] = useState(false);
  const [newsType, setNewsType] = useState("stock");
  const mainContentRef = useRef(null);

  // Handle scroll to show news dashboard
  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef.current) {
        const scrollTop = mainContentRef.current.scrollTop;
        const scrollHeight = mainContentRef.current.scrollHeight;
        const clientHeight = mainContentRef.current.clientHeight;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        console.log("Scroll percentage:", scrollPercentage);
        setShowNews(scrollPercentage > 20);
      }
    };

    const element = mainContentRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll);
      return () => element.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Determine news type based on stock selection
  useEffect(() => {
    const isCrypto = stock.includes("-USD");
    setNewsType(isCrypto ? "crypto" : "stock");
  }, [stock]);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/${stock}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        
        // Validate response structure
        if (!result.history || !Array.isArray(result.history)) {
          throw new Error("Invalid response format from backend");
        }

        // Process history: use actual prices, add predicted prices
        const actualPrices = result.history;
        const predictedPrices = actualPrices.map((_, i) => 
          i < actualPrices.length - 1 ? null : result.predictedPrice
        );

        setData({
          currentPrice: result.currentPrice,
          predictedPrice: result.predictedPrice,
          signal: result.signal,
          confidence: result.confidence,
          actualPrices,
          predictedPrices,
          stock: stock
        });

        const now = new Date();
        setLastUpdated(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to fetch prediction. Make sure backend is running on port 5000.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [stock]);

  return (
    <div className="layout">
      {/* LEFT SIDEBAR */}
      <Sidebar active={stock} setActive={setStock} />

      {/* MAIN CONTENT */}
      <main className="main-content" ref={mainContentRef}>
        {/* HEADER */}
        <div className="header">
          <h1>{stock} Forecast Dashboard</h1>
          <span>{lastUpdated ? `Last Updated ${lastUpdated}` : "Loading..."}</span>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="error-box">
            <p>⚠️ {error}</p>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="loading-box">
            <p>Loading prediction data...</p>
          </div>
        )}

        {/* DATA DISPLAY */}
        {data && !loading && (
          <>
            {/* TOP STAT CARDS */}
            <TopCards data={data} />

            {/* CHART + SIGNAL */}
            <div className="content">
              <PriceChart
                actual={data.actualPrices}
                predicted={data.predictedPrices}
                stock={stock}
              />

              <SignalCard
                signal={data.signal}
                confidence={data.confidence}
              />
            </div>

            {/* NEWS DASHBOARD - Appears when scrolling down */}
            {showNews && (
              <div className="news-wrapper">
                <NewsDashboard newsType={newsType} />
              </div>
            )}

            {/* INVESTMENT CALCULATOR - After news section */}
            {showNews && (
              <InvestmentCalculator />
            )}
          </>
        )}
      </main>
    </div>
  );
}
