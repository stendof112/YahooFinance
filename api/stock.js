// api/stock.js
const yahooFinance = require('yahoo-finance2').default;

module.exports = async (req, res) => {
  const { ticker } = req.query;  // Получаем тикер из query-параметра

  if (!ticker) {
    return res.status(400).json({ error: 'Тикер не указан' });
  }

  try {
    const result = await yahooFinance.quote(ticker);
    res.status(200).json({
      price: result.regularMarketPrice,
    });
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    res.status(500).json({ error: 'Ошибка при получении данных' });
  }
};
