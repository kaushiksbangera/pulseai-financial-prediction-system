import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

export default function PriceChart({ actual = [], predicted = [], stock = "" }) {
  // Determine currency symbol based on stock type
  const isCrypto = stock && stock.includes("-USD");
  const currencySymbol = isCrypto ? "$" : "₹";

  // 🛡 SAFETY CHECK
  if (!actual.length) {
    return <div style={{ color: "white", padding: "20px" }}>No data available</div>;
  }

  const labels = actual.map((_, i) => `Day ${i + 1}`);

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Changed to false for fixed height container
    animation: false, // CRITICAL: Disable all animations to prevent scroll lag
    interaction: {
      intersect: false,
      mode: "index"
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#94a3b8",
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "500"
          },
          boxWidth: 8
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(2, 6, 23, 0.9)",
        borderColor: "#22d3ee",
        borderWidth: 1,
        titleColor: "#ffffff",
        bodyColor: "#e2e8f0",
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (context.parsed.y !== null) {
              label += ": " + currencySymbol + context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: "#94a3b8",
          callback: function (value) {
            return currencySymbol + value.toFixed(0);
          }
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: "#94a3b8"
        },
        grid: {
          color: "rgba(255,255,255,0.05)",
          drawBorder: false
        }
      }
    }
  };

  const data = {
    labels,
    datasets: [
      {
        label: "Actual Price",
        data: actual,
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34, 211, 238, 0.05)",
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#22d3ee",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        fill: false
      },
      {
        label: "Predicted Price",
        data: predicted,
        borderColor: "#facc15",
        backgroundColor: "rgba(250, 204, 21, 0.05)",
        borderWidth: 3,
        borderDash: [6, 6],
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#facc15",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointStyle: "circle",
        fill: false
      }
    ]
  };

  return (
    <div className="glass" style={{ flex: 1, padding: "20px", height: "400px", display: "flex", flexDirection: "column" }}>
      <h3 style={{ marginTop: 0, marginBottom: "15px" }}>Price Forecast Analysis</h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
