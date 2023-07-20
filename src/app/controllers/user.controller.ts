import { NextFunction, Request, Response, Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { sendSuccess } from '../utils/responseUtils';
import { deleteTemplateByUser, getTemplatesByUser } from '../services/user.service';
import NoAuthorisationError from '../errors/noAuth.error';
import CannotFindTemplateError from '../errors/cannotFindTemplate.error';

const router = Router();

/**
 * This endpoint is used to get all user associated data .e.g. templates.
 */
router.get('/user', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userID = req.userID;
    if (!userID) throw new NoAuthorisationError();

    const templates = await getTemplatesByUser(userID);

    sendSuccess(
      res,
      {
        templates,
      },
      200,
    );
  } catch (err) {
    next(err);
  }
});

/**
 * This endpoint is used to delete a user's template.
 */
router.delete('/user/template/:templateID', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateID } = req.params;
    if (!templateID) throw new CannotFindTemplateError(String(templateID));

    const userID = req.userID;
    if (!userID) throw new NoAuthorisationError();

    const deleteTemplate = await deleteTemplateByUser(userID, Number(templateID));

    sendSuccess(
      res,
      {
        result: deleteTemplate,
      },
      200,
    );
  } catch (err) {
    next(err);
  }
});

export default router;
