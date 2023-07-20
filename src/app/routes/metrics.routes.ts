import { Router } from 'express';
import MetricsController from '../controllers/metrics.controller';

export default Router().use(MetricsController);
