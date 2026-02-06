import yfinance as yf
import numpy as np
import sys
import json

def detect_patterns(close):
    """
    Detect technical chart patterns from price data.
    Returns pattern signals and confidence boost.
    """
    patterns = {
        "bullish_engulfing": 0,
        "bearish_engulfing": 0,
        "cup_handle": 0,
        "double_bottom": 0,
        "double_top": 0,
        "ascending_triangle": 0,
        "descending_triangle": 0
    }
    
    if len(close) < 5:
        return patterns
    
    # Get recent 20 candles for pattern analysis
    recent = close[-20:]
    
    # 1. Bullish Engulfing: Small down candle followed by large up candle
    if len(recent) >= 2:
        prev_open = recent[-2]
        prev_close = recent[-2] if len(recent) > 1 else recent[-1]
        curr_open = recent[-1]
        curr_close = recent[-1]
        
        # Simplified: look at price direction
        if recent[-2] < recent[-3] and recent[-1] > recent[-2]:
            patterns["bullish_engulfing"] = 1
        if recent[-2] > recent[-3] and recent[-1] < recent[-2]:
            patterns["bearish_engulfing"] = 1
    
    # 2. Cup and Handle: V-shaped recovery followed by consolidation
    if len(recent) >= 8:
        mid_point = min(recent[-8:-2])
        left_point = recent[-8]
        right_point = recent[-1]
        if left_point > mid_point and right_point > mid_point and abs(left_point - right_point) < mid_point * 0.1:
            patterns["cup_handle"] = 1
    
    # 3. Double Bottom: Two low points at similar level followed by recovery
    if len(recent) >= 10:
        low1 = min(recent[-10:-5])
        low2 = min(recent[-5:])
        if abs(low1 - low2) < low1 * 0.05 and recent[-1] > low1 * 1.05:
            patterns["double_bottom"] = 1
    
    # 4. Double Top: Two high points at similar level followed by decline
    if len(recent) >= 10:
        high1 = max(recent[-10:-5])
        high2 = max(recent[-5:])
        if abs(high1 - high2) < high1 * 0.05 and recent[-1] < high1 * 0.95:
            patterns["double_top"] = 1
    
    # 5. Ascending Triangle: Higher lows and flat resistance
    if len(recent) >= 8:
        lows = [recent[i] for i in range(-8, 0, 2)]
        if all(lows[i] <= lows[i+1] for i in range(len(lows)-1)):
            patterns["ascending_triangle"] = 1
    
    # 6. Descending Triangle: Lower highs and flat support
    if len(recent) >= 8:
        highs = [recent[i] for i in range(-8, 0, 2)]
        if all(highs[i] >= highs[i+1] for i in range(len(highs)-1)):
            patterns["descending_triangle"] = 1
    
    return patterns

def predict_stock(symbol):
    """
    Predict stock price using moving averages, momentum, and chart patterns.
    Supports stocks (AAPL, RELIANCE.NS) and crypto (BTC-USD, ETH-USD)
    """
    try:
        # Validate symbol
        stock = symbol if symbol else "AAPL"
        if not stock or len(stock) > 15:
            raise ValueError(f"Invalid symbol: {stock}")
        
        # Fetch historical data with error handling
        print(f"Fetching data for {stock}...", file=sys.stderr)
        df = yf.download(stock, period="6mo", auto_adjust=True, progress=False)
        
        # Check if data is empty or insufficient
        if df.empty:
            raise ValueError(f"No data found for {stock}. Invalid symbol or no data available.")
        
        if len(df) < 20:
            raise ValueError(f"Insufficient data for {stock}. Only {len(df)} days of data available.")
        
        close = df["Close"].to_numpy().flatten()
        
        # Get last 30 prices for history
        history = close[-30:].round(2).tolist()
        current_price = float(close[-1])
        
        # Calculate moving averages
        ma_short = float(np.mean(close[-5:]))   # 5-day MA
        ma_long = float(np.mean(close[-20:]))   # 20-day MA
        
        # Additional metrics for better prediction
        price_momentum = (close[-1] - close[-5]) / close[-5]  # 5-day momentum
        volatility = float(np.std(close[-20:]) / np.mean(close[-20:]))  # Volatility ratio
        
        # Detect chart patterns
        patterns = detect_patterns(close)
        bullish_patterns = patterns["bullish_engulfing"] + patterns["cup_handle"] + patterns["double_bottom"] + patterns["ascending_triangle"]
        bearish_patterns = patterns["bearish_engulfing"] + patterns["double_top"] + patterns["descending_triangle"]
        
        # Generate signal based on moving averages + patterns
        ma_diff = (ma_short - ma_long) / ma_long
        
        # Base signal from moving averages
        if ma_short > ma_long * 1.02:
            signal = "BUY"
        elif ma_short < ma_long * 0.98:
            signal = "SELL"
        else:
            signal = "HOLD"
        
        # Adjust signal based on patterns
        if bullish_patterns > bearish_patterns:
            if signal == "HOLD":
                signal = "BUY"
            # Strengthen existing BUY signal
        elif bearish_patterns > bullish_patterns:
            if signal == "HOLD":
                signal = "SELL"
            # Strengthen existing SELL signal
        
        # Calculate confidence based on multiple factors
        confidence = 50
        
        # Factor in moving average spread (max +30)
        ma_strength = min(abs(ma_diff) * 200, 30)
        confidence += ma_strength
        
        # Factor in momentum (max +20)
        momentum_strength = min(abs(price_momentum) * 100, 20)
        confidence += momentum_strength
        
        # Pattern detection boost (max +15)
        pattern_boost = (bullish_patterns - bearish_patterns) * 5
        pattern_boost = max(-15, min(15, pattern_boost))
        confidence += pattern_boost
        
        # Penalize high volatility (max -10)
        volatility_penalty = min(volatility * 20, 10)
        confidence -= volatility_penalty
        
        # Bound confidence between 50 and 95
        confidence = max(50, min(95, int(confidence)))
        
        # Predict next price (weighted: 60% MA, 40% momentum projection)
        momentum_projection = current_price * (1 + price_momentum * 0.5)
        predicted_price = (ma_short * 0.6 + momentum_projection * 0.4)
        predicted_price = round(predicted_price, 2)
        
        return {
            "currentPrice": round(current_price, 2),
            "predictedPrice": predicted_price,
            "signal": signal,
            "confidence": confidence,
            "history": history,
            "patterns_detected": sum([bullish_patterns, bearish_patterns])
        }
    
    except Exception as e:
        error_msg = str(e)
        # Better error handling
        if "No data found" in error_msg or "Invalid symbol" in error_msg:
            raise ValueError(error_msg)
        if "Insufficient data" in error_msg:
            raise ValueError(error_msg)
        raise ValueError(f"Error fetching data: {error_msg}")

if __name__ == "__main__":
    try:
        stock = sys.argv[1] if len(sys.argv) > 1 else "AAPL"
        result = predict_stock(stock)
        print(json.dumps(result))
    except Exception as e:
        error_output = {
            "error": str(e),
            "symbol": sys.argv[1] if len(sys.argv) > 1 else "UNKNOWN"
        }
        print(json.dumps(error_output), file=sys.stderr)
        sys.exit(1)
