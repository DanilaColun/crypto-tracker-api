import { Router } from 'express';

export function createStatusRoutes() {
  const router = Router();

  router.get('/status', (req, res) => {
    res.status(200).send('ok');
  });

  return router;
}
