import { prisma } from '../../config/prisma';
import CannotFindResourceError from '../errors/cannotFindTemplate.error';

/**
 * Return categories and counts of associated templates.
 * TODO: remove _count from object
 */
export const getCategoriesWithCounts = async (): Promise<
  {
    id: number;
    name: string;
    createdAt: Date;
    description: string;
    templates: number;
  }[]
> => {
  const categoriesWithCount = await prisma.category.findMany({
    include: {
      _count: {
        select: { templates: true },
      },
    },
  });

  // Mapping over the categoriesWithCount array to replace _count with templates
  const categoriesWithTemplates = categoriesWithCount.map((category) => ({
    ...category,
    templates: category._count.templates,
  }));

  return categoriesWithTemplates;
};

/**
 * Get the category by given unique name
 */
export const getCategoryByName = async (
  categoryName: string,
): Promise<{
  id: number;
  name: string;
}> => {
  const result = await prisma.category.findUnique({
    where: {
      name: categoryName,
    },
  });
  if (!result) throw new CannotFindResourceError(categoryName);

  return result;
};

/**
 * Return the counts of templates by categories.
 */
export const countByCategories = async (): Promise<{ [key: string]: number }> => {
  const categories = await prisma.category.findMany();
  const categoryCounts: { [key: string]: number } = {};

  for (const category of categories) {
    const count = await prisma.template.count({
      where: {
        categoryId: category.id,
      },
    });
    categoryCounts[category.name] = count;
  }

  return categoryCounts;
};
