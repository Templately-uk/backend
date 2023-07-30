import { NextFunction, Request, Response, Router } from 'express';
import InvalidRouteError from '../errors/InvalidRoute.error';
import { sendSuccess } from '../utils/responseUtils';
import { addNewComment, deleteComment, getCommentsByTemplateRoute } from '../services/comments.service';
import authMiddleware from '../middlewares/authMiddleware';
import * as yup from 'yup';
import NoAuthorisationError from '../errors/noAuth.error';
import { rateLimit } from 'express-rate-limit';
import InvalidRouterParamError from '../errors/invalidRouterParam.error';
import optionalAuthMiddleware from '../middlewares/optionalAuthMiddleware';
import logger from '../../config/logger';

const router = Router();

/**
 * This endpoint is used to fetch all the comments for a specific template,
 * based on the provided URL route parameter.
 */
router.get('/comments/:route', optionalAuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { route } = req.params;
    if (!route) throw new InvalidRouterParamError('route');

    const comments = await getCommentsByTemplateRoute(route);

    return res.status(200).json(comments);
  } catch (err) {
    logger.error(err);
    next(err);
  }
});

/**
 * This endpoint is used to post a new comment for a specific template.
 */
const NewCommentScheme = yup.object().shape({
  route: yup.string().min(3).required(),
  comment: yup.string().min(12).required(),
});
const CreateCommentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many comments, please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
router.post(
  '/comment',
  [authMiddleware, CreateCommentLimiter],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await NewCommentScheme.validate(req.body);
      const body = {
        route: req.body.route,
        comment: req.body.comment,
      };

      const userId = req.userID;
      if (!userId) throw new NoAuthorisationError();

      await addNewComment(userId, body.route, body.comment);
      sendSuccess(res, {}, 200);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },
);

/**
 * This endpoint is used to delete a comment for a specific template when a user is logged in
 * and they own that comment.
 */
router.delete('/comment/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) throw new InvalidRouteError(['id']);

    const userId = req.userID;
    if (!userId) throw new NoAuthorisationError();

    await deleteComment(Number(id), String(userId));

    sendSuccess(res, {}, 200);
  } catch (err) {
    next(err);
  }
});

export default router;
