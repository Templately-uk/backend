import { NextFunction, Request, Response, Router } from 'express';
import { sendSuccess } from '../utils/responseUtils';
import { countTemplates } from '../services/templates.service';
import { redis } from '../../config/redis';
import { getCategoriesWithCounts } from '../services/categories.service';

const router = Router();

/**
 * This endpoint returns metrics about Templately. It is cached for performance.
 */
router.get('/metrics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check whether the data is already cached
    const dataString = await redis.get('metrics');
    let data = dataString ? (JSON.parse(dataString) as MetricsData) : null;

    // If data is not in cache, then fetch from database
    if (!data) {
      const templates = await countTemplates();
      const categories = await getCategoriesWithCounts();
      data = { templates, categories };

      // cache for 30 minutes
      await redis.set('metrics', JSON.stringify(data), 'EX', 1800);
    }

    sendSuccess(res, data, 200);
  } catch (err) {
    next(err);
  }
});

interface CategoryData {
  id: number;
  name: string;
  createdAt: Date;
  description: string;
  templates: number;
}
interface MetricsData {
  templates: number;
  categories: CategoryData[];
}

export default router;
