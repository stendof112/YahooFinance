import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export default async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ticker } = req.query;

  // Валидация тикера
  if (!ticker) {
    return res.status(400).json({ 
      error: 'Missing ticker parameter',
      example: '/api/stock?ticker=AAPL'
    });
  }

  // Обновленная валидация: буквы, цифры, точки, максимум 10 символов
  if (!/^[A-Z0-9.]{1,10}$/.test(ticker.toUpperCase())) {
    return res.status(400).json({ 
      error: 'Invalid ticker format. Allowed: letters, digits, dots. Max 10 characters',
      example: 'AAPL, GOOGL, VARO.XC, BRK.B'
    });
  }

  try {
    // Получаем данные по акции
    const quote = await yahooFinance.quote(ticker.toUpperCase());

    if (!quote) {
      return res.status(404).json({ 
        error: `Ticker ${ticker.toUpperCase()} not found`
      });
    }

    // Возвращаем данные
    return res.status(200).json({
      success: true,
      ticker: quote.symbol,
      price: quote.regularMarketPrice,
      currency: quote.currency,
      name: quote.longName || quote.shortName,
      previous_close: quote.regularMarketPreviousClose,
      change: quote.regularMarketChange,
      change_percent: quote.regularMarketChangePercent,
      timestamp: new Date(quote.regularMarketTime * 1000).toISOString(),
      market_cap: quote.marketCap,
      volume: quote.regularMarketVolume,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow
    });

  } catch (error) {
    console.error('Error fetching stock ', error);

    if (error.message.includes('No fundamentals data found')) {
      return res.status(404).json({ 
        error: `Data for ${ticker.toUpperCase()} not available`
      });
    }

    return res.status(500).json({ 
      error: 'Failed to fetch stock data',
      details: error.message 
    });
  }
}
