import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function InvestmentCalculator() {
  const [mode, setMode] = useState("lumpsum"); // "lumpsum" or "sip"
  const [investmentAmount, setInvestmentAmount] = useState(100000);
  const [duration, setDuration] = useState(10);
  const [returnRate, setReturnRate] = useState(12);
  const [results, setResults] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Calculate investment returns
  const calculateReturns = (amount, years, annualRate) => {
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    let investedAmount = 0;
    let totalValue = 0;
    const yearlyData = [];

    if (mode === "lumpsum") {
      // Lumpsum: FV = P * (1 + r)^n
      investedAmount = amount;
      totalValue = amount * Math.pow(1 + annualRate / 100, years);

      for (let y = 0; y <= years; y++) {
        const value = amount * Math.pow(1 + annualRate / 100, y);
        yearlyData.push(value);
      }
    } else {
      // SIP: FV = SIP × [((1 + r)^n - 1) / r] × (1 + r)
      const monthlySIP = amount;
      investedAmount = monthlySIP * months;

      let currentValue = 0;
      for (let m = 0; m <= months; m++) {
        if (m > 0) {
          currentValue = currentValue * (1 + monthlyRate) + monthlySIP;
        }
        if (m % 12 === 0) {
          yearlyData.push(currentValue);
        }
      }
      totalValue = currentValue;
    }

    const returns = totalValue - investedAmount;

    return {
      investedAmount: Math.round(investedAmount),
      returns: Math.round(returns),
      totalValue: Math.round(totalValue),
      yearlyData: yearlyData.map(val => Math.round(val))
    };
  };

  // Recalculate whenever inputs change
  useEffect(() => {
    const newResults = calculateReturns(investmentAmount, duration, returnRate);
    setResults(newResults);
  }, [mode, investmentAmount, duration, returnRate]);

  // Update chart whenever results change
  useEffect(() => {
    if (!results || !chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");

    // Destroy existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = Array.from({ length: results.yearlyData.length }, (_, i) => `${i}Y`);

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Portfolio Value",
            data: results.yearlyData,
            borderColor: "#22d3ee",
            backgroundColor: "rgba(34, 211, 238, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#22d3ee",
            pointBorderColor: "#0b1220",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: "#06b6d4"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: "#e2e8f0",
              font: { size: 13, weight: "600" },
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            titleColor: "#22d3ee",
            bodyColor: "#cbd5e1",
            borderColor: "#22d3ee",
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function (context) {
                return "₹ " + context.parsed.y.toLocaleString("en-IN");
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(255, 255, 255, 0.05)",
              drawBorder: false
            },
            ticks: {
              color: "#94a3b8",
              font: { size: 12 },
              callback: function (value) {
                return "₹" + (value / 100000).toFixed(1) + "L";
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: "#94a3b8",
              font: { size: 12 }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [results]);

  const formatCurrency = (value) => {
    return "₹ " + Math.round(value).toLocaleString("en-IN");
  };

  return (
    <div className="investment-calculator">
      <div className="calc-header">
        <h2>Investment Calculator</h2>
        <span className="calc-badge">FINANCIAL TOOL</span>
      </div>

      {/* MODE TOGGLE */}
      <div className="calc-toggle">
        <button
          className={`toggle-btn ${mode === "lumpsum" ? "active" : ""}`}
          onClick={() => setMode("lumpsum")}
        >
          Lumpsum
        </button>
        <button
          className={`toggle-btn ${mode === "sip" ? "active" : ""}`}
          onClick={() => setMode("sip")}
        >
          SIP
        </button>
      </div>

      {/* INPUTS SECTION */}
      <div className="calc-inputs">
        {/* Investment Amount */}
        <div className="input-group">
          <label>
            {mode === "lumpsum" ? "Investment Amount" : "Monthly SIP Amount"}
          </label>
          <div className="input-display">
            {formatCurrency(investmentAmount)}
          </div>
          <input
            type="range"
            min={mode === "lumpsum" ? 10000 : 1000}
            max={mode === "lumpsum" ? 10000000 : 100000}
            step={mode === "lumpsum" ? 10000 : 1000}
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(Number(e.target.value))}
            className="slider"
          />
          <div className="slider-range">
            <span>{formatCurrency(mode === "lumpsum" ? 10000 : 1000)}</span>
            <span>{formatCurrency(mode === "lumpsum" ? 10000000 : 100000)}</span>
          </div>
        </div>

        {/* Duration */}
        <div className="input-group">
          <label>Investment Duration</label>
          <div className="input-display">{duration} Years</div>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="slider"
          />
          <div className="slider-range">
            <span>1 Year</span>
            <span>30 Years</span>
          </div>
        </div>

        {/* Expected Return Rate */}
        <div className="input-group">
          <label>Expected Annual Return</label>
          <div className="input-display">{returnRate.toFixed(1)}%</div>
          <input
            type="range"
            min={1}
            max={30}
            step={0.5}
            value={returnRate}
            onChange={(e) => setReturnRate(Number(e.target.value))}
            className="slider"
          />
          <div className="slider-range">
            <span>1%</span>
            <span>30%</span>
          </div>
        </div>
      </div>

      {/* RESULTS SECTION */}
      {results && (
        <div className="calc-results">
          <div className="result-card primary">
            <div className="result-label">Invested Amount</div>
            <div className="result-value">
              {formatCurrency(results.investedAmount)}
            </div>
          </div>

          <div className="result-card accent">
            <div className="result-label">Estimated Returns</div>
            <div className="result-value">
              {formatCurrency(results.returns)}
            </div>
            <div className="result-percentage">
              {results.investedAmount > 0
                ? (
                    (results.returns / results.investedAmount) * 100
                  ).toFixed(1)
                : 0}
              % gain
            </div>
          </div>

          <div className="result-card success">
            <div className="result-label">Total Value</div>
            <div className="result-value">
              {formatCurrency(results.totalValue)}
            </div>
          </div>
        </div>
      )}

      {/* CHART SECTION */}
      {results && (
        <div className="calc-chart-container glass">
          <h3>Growth Projection</h3>
          <canvas ref={chartRef}></canvas>
        </div>
      )}

      {/* INFO SECTION */}
      <div className="calc-info">
        <p className="info-label">💡 Note:</p>
        <p className="info-text">
          This calculator provides estimated returns based on compound interest
          calculations. Actual results may vary based on market conditions and
          investment frequency.
        </p>
      </div>
    </div>
  );
}
