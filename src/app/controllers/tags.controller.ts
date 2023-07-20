import { NextFunction, Request, Response, Router } from 'express';
import { sendSuccess } from '../utils/responseUtils';
import { getPopularTags } from '../services/tags.service';

const router = Router();

/**
 * This endpoint returns a list of popular tags, 30 max.
 */
router.get('/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await getPopularTags();
    sendSuccess(
      res,
      {
        tags,
      },
      200,
    );
  } catch (err) {
    next(err);
  }
});

export default router;
