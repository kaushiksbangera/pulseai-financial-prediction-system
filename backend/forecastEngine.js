function generateForecast(sentiment) {
  let price = 160;
  let data = [];

  for (let i = 0; i < 30; i++) {
    let bias = (sentiment - 50) / 100;
    price += price * (Math.random() * 0.01 + bias * 0.02);
    data.push(price.toFixed(2));
  }

  let signal = "Hold";
  if (sentiment > 70) signal = "Buy";
  if (sentiment > 85) signal = "Strong Buy";
  if (sentiment < 30) signal = "Sell";
  if (sentiment < 15) signal = "Strong Sell";

  return {
    prices: data,
    nextPrice: data[data.length - 1],
    signal,
    confidence: Math.floor(70 + Math.random() * 25)
  };
}

module.exports = { generateForecast };
 