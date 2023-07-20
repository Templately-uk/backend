import { NextFunction, Request, Response, Router } from 'express';
import { sendSuccess } from '../utils/responseUtils';
import { searchTemplates } from '../services/search.service';
import * as yup from 'yup';

const router = Router();

/**
 * This endpoint is used to search for templates.
 * It uses the Prisma search functionality for finding templates.
 * TODO: improve the performance of the search
 */
// const SearchLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000,
//   max: 5,
//   message: 'Too many searches, please try again in a minute.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });
router.get('/search/:terms?', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await SearchSchema.validate(req.query);

    const { terms } = req.params;
    const { limit = 12, offset = 0, sort = 'createdAt', order = 'desc', categories = '', tags = '' } = req.query;

    const startTimeTaken = Date.now();

    const searchResult = await searchTemplates(
      terms || '',
      Number(limit),
      Number(offset),
      categories as string,
      tags as string,
      sort as string,
      order as 'asc' | 'desc',
    );

    sendSuccess(
      res,
      {
        results: searchResult,
        timeTaken: Date.now() - startTimeTaken,
      },
      200,
    );
  } catch (err) {
    next(err);
  }
});

const SearchSchema = yup.object().shape({
  limit: yup.number().integer().min(0).max(30).required(),
  offset: yup.number().min(0).integer().required(),
  sort: yup.string().oneOf(['createdAt', 'views', 'votes']).required(),
  order: yup.string().oneOf(['asc', 'desc']).required(),
  categories: yup.string(),
  tags: yup.string(),
});

export default router;
