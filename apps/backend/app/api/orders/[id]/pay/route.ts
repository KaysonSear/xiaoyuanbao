import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma, successResponse, errors, env } from '@/lib';

// 验证Token
function getUserId(req: NextRequest): string | null {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * POST /api/orders/:id/pay
 * 模拟支付订单 - 将订单状态从 pending 改为 paid
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = getUserId(req);
  if (!userId) return errors.unauthorized();

  try {
    // 查找订单
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        item: {
          select: { title: true, images: true },
        },
      },
    });

    if (!order) {
      return errors.notFound('订单不存在');
    }

    // 验证权限 - 只有买家可以支付
    if (order.buyerId !== userId) {
      return errors.forbidden('只有买家可以支付订单');
    }

    // 验证状态 - 只有 pending 状态可以支付
    if (order.status !== 'pending') {
      return errors.badRequest(`订单状态为 ${order.status}，无法支付`);
    }

    // 模拟支付 - 直接更新状态为 paid
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'paid',
      },
      include: {
        item: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
          },
        },
        buyer: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return successResponse({
      message: '支付成功',
      order: updatedOrder,
      paymentInfo: {
        orderId: id,
        amount: order.amount,
        paidAt: new Date().toISOString(),
        method: 'simulated', // 模拟支付
      },
    });
  } catch (error) {
    console.error('Payment error:', error);
    return errors.internal('支付失败');
  }
}
