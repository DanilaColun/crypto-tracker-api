import { Router } from 'express';
import { PriceService } from '../../services/priceService';
import { PriceHistoryService } from '../../services/priceHistoryService';
import { validatePriceQuery, validateHistoryQuery } from '../../validators/priceValidator';

interface PriceRoutesOptions {
  priceService: PriceService;
  priceHistoryService: PriceHistoryService;
}

export function createPriceRoutes(options: PriceRoutesOptions): Router {
  const { priceService, priceHistoryService } = options;

  const router = Router();

  router.get('/', async (req, res) => {
    const { currency } = validatePriceQuery(req.query, { requestId: req.requestId });

    const result = await priceService.getPricesByCurrency(currency, { requestId: req.requestId });

    res.status(200).json(result);
  });

  router.get('/history', async (req, res) => {
    const { currency, symbol, limit } = validateHistoryQuery(req.query, { requestId: req.requestId });

    const result = await priceHistoryService.getHistoryByCurrency(currency, {
      symbol,
      limit,
      requestId: req.requestId,
    });

    res.status(200).json(result);
  });

  return router;
}
