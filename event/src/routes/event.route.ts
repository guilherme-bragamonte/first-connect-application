import { Router } from 'express';

import { post } from '../controllers/event.controller';
import { logger } from '../utils/logger.utils';

const eventRouter: Router = Router();

eventRouter.post('/', async (req, res, next) => {
  try {
    await post(req, res);
    next();
  } catch (error) {
    logger.error(JSON.stringify({ error }));
    next(error);
  }
});

export default eventRouter;
