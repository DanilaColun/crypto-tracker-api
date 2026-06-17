import { Router } from 'express';
import { BlockchainService } from '../../services/blockchainService';
import { validateChainQuery, validateBalanceQuery } from '../../validators/blockchainValidator';

interface BlockchainRoutesOptions {
  blockchainService: BlockchainService;
}

export function createBlockchainRoutes(options: BlockchainRoutesOptions): Router {
  const { blockchainService } = options;

  const router = Router();

  router.get('/height', async (req, res) => {
    const { chain } = validateChainQuery(req.query, { requestId: req.requestId });

    const result = await blockchainService.getHeight(chain, { requestId: req.requestId });

    res.status(200).json(result);
  });

  router.get('/balance', async (req, res) => {
    const { chain, address } = validateBalanceQuery(req.query, { requestId: req.requestId });

    const result = await blockchainService.getBalance(chain, address, { requestId: req.requestId });

    res.status(200).json(result);
  });

  return router;
}
