# PulseAI Financial Prediction System

A comprehensive full-stack application for financial prediction and market analysis using machine learning, sentiment analysis, and forecasting engines.

## Project Overview

PulseAI is an intelligent financial prediction system that combines:
- **Machine Learning Models** for price prediction
- **Sentiment Analysis Engine** for news and market sentiment
- **Forecast Engine** for trend analysis
- **Interactive Dashboard** for real-time visualization

## Tech Stack

### Frontend
- **Framework**: React with Vite
- **Build Tool**: Vite
- **Styling**: CSS
- **Components**: Modular React components

### Backend
- **Runtime**: Node.js
- **Features**: 
  - Forecast Engine
  - Sentiment Engine
  - REST API Server

### Machine Learning
- **Language**: Python
- **Purpose**: Price prediction and analysis

## Project Structure

```
pulseai-app/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── InvestmentCalculator.jsx
│   │   │   ├── NewsDashboard.jsx
│   │   │   ├── PriceChart.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── SignalCard.jsx
│   │   │   └── TopCards.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
├── backend/                  # Node.js backend server
│   ├── server.js            # Main server file
│   ├── forecastEngine.js    # Price forecasting logic
│   ├── sentimentEngine.js   # Sentiment analysis logic
│   └── data/
│       └── assets.json      # Asset data
├── ml/                      # Machine learning models
│   └── predict.py           # Price prediction script
├── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8 or higher
- npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
```

### Backend Setup
```bash
npm install
```

### ML Setup
```bash
# Create a Python virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate  # On Windows

# Install Python dependencies
pip install -r requirements.txt  # If requirements.txt exists
```

## Running the Application

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```

### Start Backend Server
```bash
node backend/server.js
```

### Run ML Predictions
```bash
python ml/predict.py
```

## Features

- **Price Chart Visualization**: Real-time price charts and historical data
- **Investment Calculator**: Calculate investment returns and projections
- **News Dashboard**: Aggregated news with sentiment analysis
- **Signal Cards**: Trading signals and indicators
- **Top Cards**: Key metrics and portfolio overview
- **Sidebar Navigation**: Easy navigation between features

## API Endpoints

The backend server exposes various endpoints for:
- Fetching asset data
- Getting price forecasts
- Retrieving sentiment analysis
- Investment calculations

## Machine Learning Models

The ML component uses Python-based models for:
- Time-series price prediction
- Trend analysis
- Pattern recognition

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Contact & Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the project maintainer.

---

**Repository**: https://github.com/kaushiksbangera/pulseai-financial-prediction-system
