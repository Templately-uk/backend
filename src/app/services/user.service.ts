import { prisma } from '../../config/prisma';

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
