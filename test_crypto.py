import yfinance as yf

symbols = ['BTC-USD', 'ETH-USD', 'MATIC-USD', 'SOL-USD', 'ADA-USD']

for sym in symbols:
    data = yf.download(sym, period='1d', progress=False)
    status = 'OK' if not data.empty else 'FAIL'
    print(f'{sym}: {status}')
