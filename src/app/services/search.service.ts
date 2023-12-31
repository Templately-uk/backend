import { Prisma as PrismaType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { getUserById } from './clerk.service';

/**
 * Search for templates given a search terms input.
 * Filter and sort functionality enabled.
 * Limit the number of templates returned.
 */
export const searchTemplates = async (
  searchTerms: string,
  limit: number,
  offset: number,
  categories: string,
  tags: string,
  sort: string,
  order: 'asc' | 'desc',
): Promise<{
  hits: TemplateSearchResult[];
  totalHits: number;
  totalPages: number;
  currentPage: number;
}> => {
  // Search for the templates by given search terms where greater than 3 characters

  // Ensure that templates in search have been reviewed by a user
  const whereClause: PrismaType.TemplateWhereInput = { reviewedAt: { not: null } };
  if (searchTerms && searchTerms.length >= 3) {
    whereClause.OR = [{ title: { search: searchTerms } }, { useCase: { search: searchTerms } }];
  }

  // Filter by categories
  if (categories) {
    whereClause.category = { in: categories.split(',') };
  }

  // Filter by tags
  if (tags) {
    whereClause.tags = { some: { name: { in: tags.split(',') } } };
  }

  // Find total number of templates found
  const totalHits = await prisma.template.count({ where: whereClause });
  const totalPages = Math.ceil(totalHits / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  // Search for templates by given where clause
  const searchResults = await prisma.template.findMany({
    select: {
      id: true,
      route: true,
      title: true,
      useCase: true,
      category: true,
      tags: {
        select: {
          name: true,
        },
      },
      userId: true,
      aiTones: true,
      views: true,
      votes: true,
      createdAt: true,
      updatedAt: true,
    },
    where: whereClause,
    take: limit,
    skip: offset,
    orderBy: {
      [sort]: order,
    },
  });
  // TODO: make more efficient
  const hits = await Promise.all(
    searchResults.map(async (template) => {
      const user = await getUserById(template.userId);
      return {
        ...template,
        user: {
          name: user.name,
          image: user.image,
        },
      };
    }),
  );
  return {
    hits,
    totalHits,
    totalPages,
    currentPage,
  };
};

interface TemplateSearchResult {
  id: number;
  route: string;
  title: string;
  category: string;
  useCase: string;
  user: {
    name: string | null;
    image: string | null;
  };
  aiTones: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}
