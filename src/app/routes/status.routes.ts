import { Router, Request, Response } from 'express';
import { sendSuccess } from '../utils/responseUtils';
import authMiddleware from '../middlewares/authMiddleware';

const routes = Router();

routes.get('/', async (req: Request, res: Response) => {
  sendSuccess(res, {
    status: 200,
    timestamp: new Date(),
  });
});

routes.get('/hello', authMiddleware, async (req: Request, res: Response) => {
  sendSuccess(res, {
    status: 200,
    timestamp: new Date(),
  });
});

export default routes;
