import { useState } from "react";

export default function Sidebar({ active, setActive }) {
  const [filter, setFilter] = useState("All");

  const stocks = [
    // TOP 15 INDIAN STOCKS (NSE - Yahoo Finance format: ticker.NS)
    { id: "RELIANCE.NS", name: "Reliance Industries", category: "Indian" },
    { id: "TCS.NS", name: "Tata Consultancy Services", category: "Indian" },
    { id: "HDFCBANK.NS", name: "HDFC Bank Ltd", category: "Indian" },
    { id: "INFY.NS", name: "Infosys Limited", category: "Indian" },
    { id: "WIPRO.NS", name: "Wipro Limited", category: "Indian" },
    { id: "ICICIBANK.NS", name: "ICICI Bank Limited", category: "Indian" },
    { id: "SBIN.NS", name: "State Bank of India", category: "Indian" },
    { id: "BHARTIARTL.NS", name: "Bharti Airtel Ltd", category: "Indian" },
    { id: "AXISBANK.NS", name: "Axis Bank Limited", category: "Indian" },
    { id: "MARUTI.NS", name: "Maruti Suzuki India", category: "Indian" },
    { id: "ASIANPAINT.NS", name: "Asian Paints Limited", category: "Indian" },
    { id: "LT.NS", name: "Larsen & Toubro Ltd", category: "Indian" },
    { id: "TATASTEEL.NS", name: "Tata Steel Limited", category: "Indian" },
    { id: "BAJAJAUT0.NS", name: "Bajaj Auto Ltd", category: "Indian" },
    { id: "SUNPHARMA.NS", name: "Sun Pharma Industries", category: "Indian" },

    // TOP 10 CRYPTOCURRENCIES (Yahoo Finance format - will be converted to INR)
    { id: "BTC-USD", name: "Bitcoin ($)", category: "Crypto" },
    { id: "ETH-USD", name: "Ethereum ($)", category: "Crypto" },
    { id: "BNB-USD", name: "Binance Coin ($)", category: "Crypto" },
    { id: "XRP-USD", name: "Ripple ($)", category: "Crypto" },
    { id: "ADA-USD", name: "Cardano ($)", category: "Crypto" },
    { id: "SOL-USD", name: "Solana ($)", category: "Crypto" },
    { id: "DOGE-USD", name: "Dogecoin ($)", category: "Crypto" },
    { id: "DOT-USD", name: "Polkadot ($)", category: "Crypto" },
    { id: "LINK-USD", name: "Chainlink ($)", category: "Crypto" },
    { id: "AVAX-USD", name: "Avalanche ($)", category: "Crypto" },
  ];

  // Filter stocks based on selected filter
  let filteredStocks = stocks;
  if (filter === "Indian") {
    filteredStocks = stocks.filter(s => s.category === "Indian");
  } else if (filter === "Crypto") {
    filteredStocks = stocks.filter(s => s.category === "Crypto");
  }

  const filterButtons = [
    { label: "All", icon: "", value: "All" },
    { label: "Stocks", icon: "", value: "Indian" },
    { label: "Crypto", icon: "", value: "Crypto" },
  ];

  return (
    <aside className="glass" style={{ width: 280, padding: 20, overflowY: "auto", maxHeight: "100vh" }}>
      <h2 style={{ color: "var(--accent)", marginBottom: 5 }}>PulseAI</h2>
      <p style={{ color: "var(--muted)", marginBottom: 20, fontSize: 12 }}>
        Market Intelligence Pro
      </p>

      {/* Filter Buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {filterButtons.map(btn => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            style={{
              flex: 1,
              padding: "8px 12px",
              fontSize: 11,
              fontWeight: "600",
              border: filter === btn.value ? "2px solid var(--accent)" : "1px solid var(--border)",
              backgroundColor: filter === btn.value ? "rgba(0, 255, 255, 0.15)" : "transparent",
              color: filter === btn.value ? "var(--accent)" : "var(--muted)",
              cursor: "pointer",
              borderRadius: 6,
              transition: "all 0.2s ease",
              textAlign: "center",
            }}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>

      {/* Stock List */}
      <div style={{ marginTop: 15 }}>
        {filteredStocks.map(s => (
          <div
            key={s.id}
            onClick={() => setActive(s.id)}
            className="glass"
            style={{
              padding: 12,
              marginTop: 8,
              cursor: "pointer",
              border:
                active === s.id
                  ? "2px solid var(--accent)"
                  : "1px solid var(--border)",
              transition: "all 0.2s ease",
              backgroundColor: active === s.id ? "rgba(0, 255, 255, 0.05)" : "transparent"
            }}
          >
            <strong style={{ fontSize: 12 }}>{s.id}</strong>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>
              {s.name}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
