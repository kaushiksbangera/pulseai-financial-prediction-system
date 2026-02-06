export default function TopCards({ data }) {
  // Determine currency symbol based on stock type
  const isCrypto = data.stock && data.stock.includes("-USD");
  const currencySymbol = isCrypto ? "$" : "₹";

  // Calculate direction and percentage change
  const change = data.predictedPrice - data.currentPrice;
  const changePercent = ((change / data.currentPrice) * 100).toFixed(2);
  const direction = change > 0 ? "↑" : change < 0 ? "↓" : "→";
  const directionColor = change > 0 ? "var(--success)" : change < 0 ? "#ef4444" : "var(--muted)";

  return (
    <div className="stats-grid">
      <div className="glass stat">
        <p>Current Price</p>
        <h2>{currencySymbol} {data.currentPrice.toFixed(2)}</h2>
      </div>

      <div className="glass stat highlight">
        <p>Predicted Next</p>
        <h2>{currencySymbol} {data.predictedPrice.toFixed(2)}</h2>
      </div>

      <div className="glass stat">
        <p>Direction</p>
        <h2 style={{ color: directionColor }}>
          {direction} {change > 0 ? "Up" : change < 0 ? "Down" : "Flat"}
        </h2>
      </div>

      <div className="glass stat">
        <p>Change</p>
        <h2 style={{ color: directionColor }}>
          {change > 0 ? "+" : ""}{changePercent}%
        </h2>
      </div>
    </div>
  );
}
