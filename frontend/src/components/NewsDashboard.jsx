import { useState, useEffect } from "react";

export default function NewsSection({ newsType = "stock" }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5000/api/news/${newsType}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }

        const data = await response.json();
        
        if (data.articles && Array.isArray(data.articles)) {
          setNews(data.articles.slice(0, 10)); // Limit to 10 items
        } else {
          setError("No news available");
        }
      } catch (err) {
        console.error("News fetch error:", err);
        setError("Unable to load news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsType]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(hours / 24);

      if (hours < 1) return "Just now";
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="news-section">
      <div className="news-header">
        <h2>Latest {newsType === "stock" ? "Stock" : "Crypto"} News</h2>
        <span className="news-type-badge">{newsType.toUpperCase()}</span>
      </div>

      {loading && (
        <div className="news-loading">
          <div className="spinner"></div>
          <p>Loading news...</p>
        </div>
      )}

      {error && !loading && (
        <div className="news-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && news.length > 0 && (
        <div className="news-grid">
          {news.map((article, index) => (
            <article 
              key={index} 
              className="news-card glass"
              onClick={() => window.open(article.url, "_blank")}
            >
              {article.image && (
                <div className="news-image-container">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="news-image"
                    onError={(e) => e.target.style.display = "none"}
                  />
                </div>
              )}
              
              <div className="news-content">
                <h3>{article.title}</h3>
                
                {article.description && (
                  <p className="news-description">{article.description}</p>
                )}
                
                <div className="news-meta">
                  <span className="news-source">{article.source}</span>
                  <span className="news-time">{formatDate(article.published)}</span>
                </div>
              </div>

              <div className="news-card-action">
                <span className="arrow">→</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && news.length === 0 && !error && (
        <div className="news-empty">
          <p>No {newsType} news available at the moment.</p>
        </div>
      )}
    </div>
  );
}
