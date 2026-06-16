import { Router } from 'express';
import { PriceService } from '../../services/priceService';
import { validatePriceQuery } from '../../validators/priceValidator';

interface PriceRoutesOptions {
  priceService: PriceService;
}

export function createPriceRoutes(options: PriceRoutesOptions): Router {
  const { priceService } = options;

  const router = Router();

  router.get('/', async (req, res) => {
    const { currency } = validatePriceQuery(req.query, { requestId: req.requestId });

    const result = await priceService.getPricesByCurrency(currency, { requestId: req.requestId });

    res.status(200).json(result);
  });

  return router;
}
