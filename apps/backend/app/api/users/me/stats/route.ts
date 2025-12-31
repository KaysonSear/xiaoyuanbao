import { NextRequest, NextResponse } from 'next/server';
import { prisma, env } from '@/lib';
import jwt from 'jsonwebtoken';

// Helper to get user from token
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

// GET /api/users/me/stats - 获取当前用户的统计数据
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '请先登录' } },
        { status: 401 }
      );
    }

    // 并行查询所有统计数据
    const [publishedCount, soldCount, boughtCount] = await Promise.all([
      // 发布的物品数量 (不包括已删除)
      prisma.item.count({
        where: {
          sellerId: userId,
          status: { not: 'removed' },
        },
      }),
      // 卖出的订单数量 (通过 item.sellerId 关联)
      prisma.order.count({
        where: {
          item: {
            sellerId: userId,
          },
          status: { in: ['paid', 'completed'] },
        },
      }),
      // 买到的订单数量 (已支付或已完成)
      prisma.order.count({
        where: {
          buyerId: userId,
          status: { in: ['paid', 'completed'] },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        published: publishedCount,
        sold: soldCount,
        bought: boughtCount,
      },
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '获取统计数据失败' } },
      { status: 500 }
    );
  }
}
