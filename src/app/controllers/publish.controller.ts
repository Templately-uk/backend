import { rateLimit } from 'express-rate-limit';
import { NextFunction, Request, Response, Router } from 'express';
import * as yup from 'yup';
import authMiddleware from '../middlewares/authMiddleware';
import NoAuthorisationError from '../errors/noAuth.error';
import { insertNewTemplate } from '../services/templates.service';
import { sendSuccess } from '../utils/responseUtils';
import logger from '../../config/logger';
import UnexpectedDatabaseError from '../errors/unexpectedDatabase.error';
import { templateAnalysisQueue } from '../../config/redis';
import Filter from 'bad-words';
import { Categories } from '../types/category';
import sanitizeHtml from 'sanitize-html';

const router = Router();

/**
 * This endpoint is used to publish a new template to the database.
 * Returns the slug of the new template.
 */
const CreateTemplateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many templates, please wait and try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
router.post(
  '/publish',
  [authMiddleware, CreateTemplateLimiter],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await NewTemplateScheme.validate(req.body);

      // Sanitze the html for XSS attacks
      const sanitizedTemplate = sanitizeHtml(req.body.template);

      const body = {
        title: req.body.title,
        category: String(req.body.category).toLowerCase().trim(),
        tags: req.body.tags?.map((tag: string) => String(tag).toLowerCase().replace(' ', '_')),
        useCase: req.body.usecase,
        template: sanitizedTemplate,
      };

      // Check if the template contains profanity
      if (filter.isProfane(body.template) || filter.isProfane(body.title) || filter.isProfane(body.useCase)) {
        throw new Error('Template contains profanity');
      }

      if (!req.userID) throw new NoAuthorisationError();
      const userID = req.userID;

      logger.info(`Publishing a new template for user ${userID}: ${body.title}`);

      // Attempt to insert the new template into the database
      const result = await insertNewTemplate({ userID, ...body });
      if (!result) throw new UnexpectedDatabaseError();

      templateAnalysisQueue.add({
        // Perform an analysis on the template with ChatGPT
        // for sentient analysis
        templateId: result.id,
      });

      sendSuccess(
        res,
        {
          route: result.route,
        },
        200,
      );
    } catch (err) {
      next(err);
    }
  },
);

const NewTemplateScheme = yup.object().shape({
  title: yup.string().min(6).max(64).required(),
  category: yup
    .string()
    .oneOf(Object.keys(Categories) as string[], 'Invalid category')
    .required(),
  tags: yup.array().of(yup.string()),
  usecase: yup.string().min(32).max(164).required(),
  template: yup.string().min(32).required(),
});

const filter = new Filter();

export default router;
