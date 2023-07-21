import { Category, Tag, Template } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { getCategoryByName } from './categories.service';
import { findOrCreateTags } from './tags.service';
import CannotFindTemplateError from '../errors/cannotFindTemplate.error';
import { getUserById } from './clerk.service';

/**
 * Count all templates.
 */
export const countTemplates = async (): Promise<number> => {
  const count = await prisma.template.count({});
  return count;
};

/**
 * Get template by specific slug.
 */
export const getTemplateByRoute = async (
  route: string,
): Promise<{
  template: Template;
  user: {
    image: string;
    name: string;
  };
  category: Category;
  tags: Tag[];
}> => {
  const record = await prisma.template.findUnique({
    where: {
      route,
    },
    include: {
      category: true,
      tags: true,
    },
  });
  if (!record) throw new CannotFindTemplateError(route);

  const user = await getUserById(record.userId);

  return {
    template: record,
    user,
    category: record.category,
    tags: record.tags,
  };
};

/**
 * Insert a new template into the database.
 */
export const insertNewTemplate = async ({
  userID,
  title,
  category,
  tags,
  useCase,
  template,
}: insertNewTemplateResponse) => {
  // Find a unique URL route for template
  const route = title.replace(/\s/g, '_').toLowerCase();
  const uniqueRoute = await findUniqueRoute(route);

  // Find category
  const categoryModel = await getCategoryByName(category);

  // Find tags to use or create new ones
  const tagsToAssign = await findOrCreateTags(userID, tags);

  const insert = await prisma.template.create({
    data: {
      route: uniqueRoute,
      userId: userID,
      categoryId: categoryModel.id,
      title: title,
      summary: useCase,
      body: template,
      aiTones: '',
      tags: {
        connect: tagsToAssign.map((tag) => ({ id: tag.id })), // Connect existing tags
      },
    },
  });
  if (!insert) return;

  return insert;
};
interface insertNewTemplateResponse {
  userID: string;
  title: string;
  category: string;
  tags: string[];
  useCase: string;
  template: string;
}

/**
 * Find a unique slug/route for a new template.
 */
const findUniqueRoute = async (initialRoute: string): Promise<string> => {
  let uniqueRoute = initialRoute;
  let i = 1;

  let existingTemplate = await prisma.template.findFirst({
    where: {
      route: uniqueRoute,
    },
  });

  while (existingTemplate) {
    uniqueRoute = `${initialRoute}_${i}`;
    existingTemplate = await prisma.template.findFirst({
      where: {
        route: uniqueRoute,
      },
    });
    i++;
  }

  return uniqueRoute;
};

/**
 * Get templates from an array of ids identifiable to templates.
 */
export const getTemplatesByIds = async (ids: number[]): Promise<getTemplatesByIdsResponse[]> => {
  const templates = await prisma.template.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      route: true,
      title: true,
      summary: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
      aiTones: true,
      views: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return templates;
};
interface getTemplatesByIdsResponse {
  id: number;
  route: string;
  title: string;
  user: {
    name: string | null;
    image: string | null;
  };
  aiTones: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Increment views on template.
 */
export const incrementViews = async (templateId: number) => {
  // Update
  await prisma.template.update({
    where: {
      id: templateId,
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });
};
