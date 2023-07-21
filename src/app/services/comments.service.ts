import { prisma } from '../../config/prisma';
import { getUserById } from './clerk.service';

/**
 * Return the comments for a template.
 */
export const getCommentsByTemplateRoute = async (
  route: string,
): Promise<
  {
    id: number;
    content: string;
    createdAt: Date;
    user?: {
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
      userId: true, // Assuming the 'comment' model has 'userId'
    },
  });

  // Fetch user details for each comment and construct the final comments array.
  const finalComments = await Promise.all(
    comments.map(async (comment) => {
      let user;

      if (comment.userId) {
        user = await getUserById(comment.userId);
      }

      return {
        ...comment,
        user,
      };
    }),
  );

  return finalComments;
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
