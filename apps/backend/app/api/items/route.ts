import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma, successResponse, errors, env } from '@/lib';
import jwt from 'jsonwebtoken';

// 验证token获取用户ID (Helper)
function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, env.JWT_SECRET || 'fallback-secret-for-dev') as {
      userId: string;
    };
    return decoded.userId;
  } catch {
    return null;
  }
}

// 查询参数 schema
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(20),
  category: z.string().optional(),
  status: z.enum(['available', 'sold', 'removed']).optional(),
  keyword: z.string().optional(),
  sortBy: z.enum(['createdAt', 'price']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  sellerId: z.string().optional(),
  isFavorite: z.enum(['true', 'false']).optional(),
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
      sellerId: searchParams.get('sellerId') || undefined,
      isFavorite: searchParams.get('isFavorite') || undefined,
    };

    const parsed = querySchema.safeParse(params);
    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { page, pageSize, category, status, keyword, sortBy, sortOrder, sellerId, isFavorite } =
      parsed.data;

    // 如果请求收藏列表，必须登录
    let currentUserId: string | null = null;
    if (isFavorite === 'true') {
      currentUserId = getUserIdFromToken(request);
      if (!currentUserId) {
        return errors.unauthorized('查看收藏需先登录');
      }
    }

    // 构建查询条件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {
      // 如果指定了 sellerId (查看某人发布的)，则不限制 status (可能查看自己已下架的?)
      // 这里简化：如果查看自己的发布，可能包含 sold/removed?
      // 暂时保持默认: status provided or 'available'
      status: status || (sellerId ? undefined : 'available'),
    };

    if (category) where.category = category;
    if (sellerId) where.sellerId = sellerId;

    // 关键词搜索
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // 收藏筛选
    if (isFavorite === 'true' && currentUserId) {
      where.favorites = {
        some: {
          userId: currentUserId,
        },
      };
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
              school: true,
            },
          },
        },
      }),
      prisma.item.count({ where }),
    ]);

    // 如果用户已登录，为每个物品添加 isFavorite 标记
    // 注意：如果是 `isFavorite=true` 筛选，则所有返回项 naturally true?
    // 但为了通用性，还是 check 一下 (或者前端 assume true if context is favorites)
    // 这里暂时不批量 check isFavorite state for each item (N+1 prob), mobile details handles exact check.
    // 若要支持列表页显示爱心状态:
    /*
      const itemsWithFav = await Promise.all(items.map(async (item) => {
         const isFav = ...
         return { ...item, isFavorite: isFav }
      }))
    */
    // 处理图片: 压缩后的 Base64 可以返回,但大的 Base64 使用占位符
    const MAX_BASE64_SIZE = 200000; // 200KB 阈值 (前端已压缩到 15% 质量)
    const processedItems = items.map((item) => ({
      ...item,
      images: item.images.map((img: string) => {
        // http 图片直接返回
        if (img.startsWith('http')) return img;
        // Base64 图片检查大小
        if (img.startsWith('data:image/') && img.length < MAX_BASE64_SIZE) {
          return img; // 小于 50KB 返回原图
        }
        // 大的 Base64 返回占位符
        return 'https://via.placeholder.com/400x400?text=Image';
      }),
    }));

    return successResponse({
      items: processedItems,
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
