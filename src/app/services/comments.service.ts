import { prisma } from '../../config/prisma';

/**
 * Return the comments for a template.
 */
export const getCommentsByTemplateRoute = async (
  route: string,
  userId: string | undefined,
): Promise<
  {
    id: number;
    content: string;
    createdAt: Date;
    user: {
      name: string | null;
      image: string | null;
    };
  }[]
> => {
  const template = await prisma.template.findUniqueOrThrow({
    select: {
      route: true,
      id: true,
    },
    where: {
      route,
    },
  });

  const comments = await prisma.comment.findMany({
    where: {
      templateId: template.id,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          image: true,
          id: true,
        },
      },
    },
  });

  // Map over comments and add where logged in user is the owner
  const commentsWithOwner = comments.map((record) => ({
    ...record,
    owner: record.user.id === userId,
  }));

  return commentsWithOwner;
};

/**
 * Insert a new comment to template.
 */
export const addNewComment = async (userId: string, route: string, content: string) => {
  const template = await prisma.template.findUniqueOrThrow({
    select: {
      route: true,
      id: true,
    },
    where: {
      route,
    },
  });

  const insert = await prisma.comment.create({
    data: {
      templateId: template.id,
      userId: userId,
      content,
    },
  });

  return insert;
};

/**
 * Delete an existing comment from template.
 */
export const deleteComment = async (commentId: number, userId: string) => {
  await prisma.comment.deleteMany({
    where: {
      id: commentId,
      userId: userId,
    },
  });
};
