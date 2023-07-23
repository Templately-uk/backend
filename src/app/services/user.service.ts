import { prisma } from '../../config/prisma';
import { getUserById } from './clerk.service';

/**
 * Get all user-owned templates.
 */
export const getTemplatesByUser = async (userID: string): Promise<GetTemplatesByUserResponse[]> => {
  const templates = await prisma.template.findMany({
    where: {
      userId: userID,
    },
    select: {
      id: true,
      route: true,
      title: true,
      useCase: true,
      userId: true,
      category: true,
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

  const user = await getUserById(userID);

  // TODO: make more efficient
  const hits = await Promise.all(
    templates.map(async (template) => {
      return {
        ...template,
        user,
      };
    }),
  );

  return hits;
};
interface GetTemplatesByUserResponse {
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
 * Remove user-owned template.
 */
export const deleteTemplateByUser = async (userID: string, templateID: number) => {
  const result = await prisma.template.delete({
    where: {
      id: templateID,
      userId: userID,
    },
  });
  return result;
};
