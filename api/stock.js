// api/stock.js
const yahooFinance = require('yahoo-finance2').default;

module.exports = async (req, res) => {
  const { ticker } = req.query; // ?ticker=XOM

  if (!ticker) {
    return res.status(400).json({ error: 'Тикер не указан' });
  }

  try {
    // 1) Берём модуль price через quoteSummary
    const result = await yahooFinance.quoteSummary(ticker, {
      modules: ['price'],
    });

    // 2) Цена теперь лежит в result.price.regularMarketPrice
    const price = result?.price?.regularMarketPrice;

    if (price == null) {
      return res
        .status(502)
        .json({ error: 'Цена не найдена в ответе Yahoo' });
    }

    res.status(200).json({ price });
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    res
      .status(500)
      .json({ error: error.message || 'Ошибка при получении данных' });
  }
};
