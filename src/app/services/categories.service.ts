import { prisma } from '../../config/prisma';
import { Categories } from '../types/category';

export async function countTemplatesByAllCategories(): Promise<{ category: string; count: number }[]> {
  const counts: { category: string; count: number }[] = [];

  for (const category of Object.keys(Categories) as string[]) {
    const count = await prisma.template.count({
      where: {
        category: category,
      },
    });

    counts.push({ category, count });
  }

  return counts;
}
