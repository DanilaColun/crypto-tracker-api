import { Router } from 'express';
import { ConflictError } from '../../errors/ConflictError';
import { NotFoundError } from '../../errors/NotFoundError';
import { ValidationError } from '../../errors/ValidationError';
import { CurrencyRepository } from '../../repositories/currencyRepository';
import { normalizeTicker, validateCurrencyPayload } from '../../validators/currencyValidator';

interface CurrencyRoutesOptions {
  currencyRepository: CurrencyRepository;
}

export function createCurrencyRoutes(options: CurrencyRoutesOptions): Router {
  const { currencyRepository } = options;

  const router = Router();

  router.get('/', async (req, res) => {
    const currencies = await currencyRepository.findAll();

    res.status(200).json(currencies);
  });

  router.post('/', async (req, res) => {
    const currencyData = validateCurrencyPayload(req.body, { requestId: req.requestId });

    if (await currencyRepository.exists(currencyData.ticker)) {
      throw new ConflictError('Currency already exists', {
        requestId: req.requestId,
        context: {
          ticker: currencyData.ticker,
        },
      });
    }

    const currency = await currencyRepository.create(currencyData);

    res.status(201).json(currency);
  });

  router.get('/:ticker', async (req, res) => {
    const ticker = normalizeTicker(req.params.ticker);
    const currency = await currencyRepository.findByTicker(ticker);

    if (!currency) {
      throw new NotFoundError('Currency not found', {
        requestId: req.requestId,
        context: {
          ticker,
        },
      });
    }

    res.status(200).json(currency);
  });

  router.put('/:ticker', async (req, res) => {
    const ticker = normalizeTicker(req.params.ticker);
    const currencyData = validateCurrencyPayload(req.body, { requestId: req.requestId });

    if (currencyData.ticker !== ticker) {
      throw new ValidationError('Ticker must match URL', {
        requestId: req.requestId,
        context: {
          urlTicker: ticker,
          bodyTicker: currencyData.ticker,
        },
      });
    }

    const updatedCurrency = await currencyRepository.update(ticker, currencyData);

    if (!updatedCurrency) {
      throw new NotFoundError('Currency not found', {
        requestId: req.requestId,
        context: {
          ticker,
        },
      });
    }

    res.status(200).json(updatedCurrency);
  });

  router.delete('/:ticker', async (req, res) => {
    const ticker = normalizeTicker(req.params.ticker);
    const isDeleted = await currencyRepository.delete(ticker);

    if (!isDeleted) {
      throw new NotFoundError('Currency not found', {
        requestId: req.requestId,
        context: {
          ticker,
        },
      });
    }

    res.status(204).send();
  });

  return router;
}
