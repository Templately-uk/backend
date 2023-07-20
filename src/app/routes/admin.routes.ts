import { ExpressAdapter } from '@bull-board/express';
import { Router } from 'express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { createBullBoard } from '@bull-board/api';
import { templateAnalysisQueue } from '../../config/redis';
import expressBasicAuth from 'express-basic-auth';

/**
 * Admin routes:
 * - queues: monitor the redis queues
 */
const routes = Router();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullAdapter(templateAnalysisQueue)],
  serverAdapter: serverAdapter,
});

// const enableReadOnly = (req: Request, res: Response, next: NextFunction) => {
//   if (req.method == 'PUT') {
//     res.status(403).send('Bull board is in read-only mode');
//     return;
//   }
//   next();
// };

routes.use(
  '/admin/queues',
  expressBasicAuth({
    users: { admin: 'password' }, // replace 'admin' and 'password' with your desired username and password
    challenge: true,
  }),
  serverAdapter.getRouter(),
);

export default routes;
