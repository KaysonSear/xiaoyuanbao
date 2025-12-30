import { NextRequest } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma, successResponse, errors, env } from '@/lib';

// 创建物品 schema
const createItemSchema = z.object({
  title: z.string().min(2, '标题至少2个字符').max(50, '标题最多50个字符'),
  description: z.string().min(10, '描述至少10个字符').max(2000, '描述最多2000个字符'),
  price: z.number().min(0.01, '价格必须大于0'),
  images: z
    .array(
      z
        .string()
        .refine(
          (val) =>
            val.startsWith('data:image/') ||
            val.startsWith('http://') ||
            val.startsWith('https://'),
          { message: '图片格式无效' }
        )
    )
    .min(1, '至少上传1张图片')
    .max(9, '最多9张图片'),
  condition: z.enum(['全新', '9成新', '8成新', '7成新', '6成新以下']),
  category: z.string().min(1, '请选择分类'),
});

// 验证token
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

// 发布物品
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return errors.unauthorized('请先登录');
    }

    const body = await request.json();
    const parsed = createItemSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { title, description, price, images, condition, category } = parsed.data;

    // 创建物品
    const item = await prisma.item.create({
      data: {
        title,
        description,
        price,
        images,
        condition,
        category,
        sellerId: userId,
        status: 'available',
      },
      include: {
        seller: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });

    return successResponse(item);
  } catch (error) {
    console.error('Create item error:', error);
    return errors.internal('发布物品失败');
  }
}
