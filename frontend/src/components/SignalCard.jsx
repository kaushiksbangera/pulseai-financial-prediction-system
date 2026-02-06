export default function SignalCard({ signal, confidence }) {
  // Determine color based on signal
  const signalColors = {
    "BUY": "#22c55e",
    "SELL": "#ef4444",
    "HOLD": "#facc15",
    "Strong Buy": "#10b981",
    "Strong Sell": "#dc2626"
  };

  const signalColor = signalColors[signal] || "#94a3b8";

  // Determine signal description
  const signalDescriptions = {
    "BUY": "Market conditions suggest upward momentum. Consider buying.",
    "SELL": "Market conditions suggest downward momentum. Consider selling.",
    "HOLD": "Market appears balanced. Hold your current position.",
    "Strong Buy": "Strong bullish signals detected. High confidence buy.",
    "Strong Sell": "Strong bearish signals detected. High confidence sell."
  };

  const description = signalDescriptions[signal] || "AI analysis of historical patterns and technical indicators.";

  return (
    <div className="glass" style={{ width: "300px", padding: "20px", flexShrink: 0 }}>
      <p style={{ color: "var(--muted)", margin: "0 0 10px 0" }}>AI Market Signal</p>

      <h1 style={{ color: signalColor, margin: "10px 0", fontSize: "2.5em" }}>
        {signal}
      </h1>

      <p style={{ color: "var(--muted)", margin: "15px 0 5px 0" }}>Confidence Score</p>
      <h2 style={{ color: signalColor, margin: "0 0 15px 0" }}>
        {confidence}%
      </h2>

      {/* Confidence bar */}
      <div style={{
        width: "100%",
        height: "8px",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: "4px",
        overflow: "hidden",
        marginBottom: "15px"
      }}>
        <div style={{
          width: `${confidence}%`,
          height: "100%",
          backgroundColor: signalColor,
          transition: "width 0.3s ease"
        }}></div>
      </div>

      <p style={{ fontSize: "13px", color: "var(--muted)", margin: "10px 0 0 0", lineHeight: "1.5" }}>
        {description}
      </p>
    </div>
  );
}
