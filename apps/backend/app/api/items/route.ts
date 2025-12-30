import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma, successResponse, errors } from '@/lib';

// 查询参数 schema
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(20),
  category: z.string().optional(),
  status: z.enum(['available', 'sold', 'removed']).optional(),
  keyword: z.string().optional(),
  sortBy: z.enum(['createdAt', 'price']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// 获取物品列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { page, pageSize, category, status, keyword, sortBy, sortOrder } = parsed.data;

    // 构建查询条件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      status: status || 'available',
    };

    if (category) where.category = category;
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // 查询数据
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          images: true,
          condition: true,
          category: true,
          status: true,
          createdAt: true,
          seller: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.item.count({ where }),
    ]);

    return successResponse({
      items,
      pagination: {
        page,
        pageSize,
        total,
        hasMore: page * pageSize < total,
      },
    });
  } catch (error) {
    console.error('Get items error:', error);
    return errors.internal('获取物品列表失败');
  }
}
