import { prisma } from '../../config/prisma';
import { getUserById } from './clerk.service';

/**
 * Return the comments for a template.
 */
export const getCommentsByTemplateRoute = async (
  templateRoute: string,
  loggedInUserId?: string,
): Promise<
  {
    id: number;
    comment: string;
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
      route: templateRoute,
    },
  });

  const comments = await prisma.comment.findMany({
    where: {
      templateId: template.id,
    },
    select: {
      id: true,
      comment: true,
      createdAt: true,
      userId: true, // Assuming the 'comment' model has 'userId'
    },
  });

  // Fetch user details for each comment and construct the final comments array.
  const finalComments = await Promise.all(
    comments.map(async (comment) => {
      let user;
      let owner = false;

      if (comment.userId) {
        const clerkUser = await getUserById(comment.userId);
        user = {
          name: clerkUser.name,
          image: clerkUser.image,
        };

        if (loggedInUserId && loggedInUserId === comment.userId) owner = true;
        console.log(loggedInUserId + ':' + comment.userId);
      } else {
        user = {
          name: null,
          image: null,
        };
      }

      return {
        ...comment,
        user,
        owner,
      };
    }),
  );

  return finalComments;
};

/**
 * Insert a new comment to template.
 */
export const addNewComment = async (userId: string, route: string, comment: string) => {
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
      comment,
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
