import { Tag } from '@prisma/client';
import { prisma } from '../../config/prisma';

/**
 * Return 30 tags from the database.
 */
export const getPopularTags = async (): Promise<
  {
    id: number;
    name: string;
    createdAt: Date;
  }[]
> => {
  const records = await prisma.tag.findMany({
    take: 30,
  });
  return records;
};

/**
 * Find tags from database by name.
 */
export const getTagsByNames = async (tags: string[]): Promise<{ name: string; id: number }[]> => {
  const foundTags = await prisma.tag.findMany({
    where: {
      name: {
        in: tags,
      },
    },
  });

  if (foundTags.length !== tags.length) {
    const foundTagNames = foundTags.map((tag) => tag.name);
    const notFoundTags = tags.filter((tagName) => !foundTagNames.includes(tagName));
    throw new Error('tags: ' + notFoundTags.join(', '));
  }

  return foundTags.map((tag) => ({ name: tag.name, id: tag.id }));
};

/**
 * Find tags from database, if not found, create them.
 */
export const findOrCreateTags = async (userID: string, tags: string[]): Promise<Tag[]> => {
  // Creating an empty array for all processed tags
  const processedTags = [];

  for (const tag of tags) {
    let foundTag = await prisma.tag.findFirst({
      where: {
        name: tag,
        userId: userID,
      },
    });

    // Create the tag if it does not exist
    if (!foundTag) {
      foundTag = await prisma.tag.create({
        data: {
          name: tag,
          userId: userID,
        },
      });
    }

    processedTags.push(foundTag);
  }

  return processedTags;
};
