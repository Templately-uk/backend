import { NextFunction, Request, Response, Router } from 'express';
import InvalidRouteError from '../errors/InvalidRoute.error';
import { getTemplateByRoute, incrementViews } from '../services/templates.service';
import { sendSuccess } from '../utils/responseUtils';
import { redis } from '../../config/redis';
import { Category, Tag, Template, User } from '@prisma/client';

const router = Router();

interface TemplateData {
  template: Template;
  user: User;
  category: Category;
  tags: Tag[];
}
/**
 * This endpoint is used to fetch a specific template along with its metadata,
 * based on the provided URL route parameter.
 */
router.get('/template/:route', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { route } = req.params;
    if (!route) throw new InvalidRouteError(['route']);

    // Try to fetch data from redis cache
    const redisKey = `get_templates_${route}`;
    const dataString = await redis.get(redisKey);
    let data: TemplateData | null = dataString ? (JSON.parse(dataString) as TemplateData) : null;

    if (!data) {
      data = await getTemplateByRoute(route);
      await redis.set(route, JSON.stringify(data), 'EX', 300); // cache for 5 minutes
    }
    if (!data) throw new Error('Could not find template');

    incrementViews(data.template.id).catch(console.error);

    sendSuccess(
      res,
      {
        template: {
          id: data.template.id,
          route: data.template.route,
          title: data.template.title,
          summary: data.template.summary,
          body: data.template.body,
          aiTones: data.template.aiTones,
          createdAt: data.template.createdAt,
          updatedAt: data.template.updatedAt,
          user: {
            name: data.user.name,
            image: data.user.image,
          },
          category: {
            id: data.category.id,
            name: data.category.name,
          },
          reviewed: true,
          tags: data.tags,
        },
      },
      200,
    );
  } catch (err) {
    next(err);
  }
});

export default router;
