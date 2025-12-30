import { NextRequest } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { prisma, successResponse, errors, parseBody, env } from '@/lib';

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

const updateStatusSchema = z.object({
  action: z.enum(['pay', 'ship', 'confirm', 'cancel']),
});

// GET - 获取订单详情
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = getUserId(req);
  if (!userId) return errors.unauthorized();

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        item: {
          include: {
            seller: {
              select: { id: true, nickname: true, avatar: true, phone: true },
            },
          },
        },
        buyer: {
          select: { id: true, nickname: true, avatar: true, phone: true },
        },
      },
    });

    if (!order) return errors.notFound('订单不存在');

    // 检查权限 - 买家或卖家都可以查看
    const isBuyer = order.buyerId === userId;
    const isSeller = order.item.sellerId === userId;

    if (!isBuyer && !isSeller) {
      return errors.forbidden();
    }

    return successResponse(order);
  } catch (err) {
    console.error('Get order error:', err);
    return errors.internal('获取订单详情失败');
  }
}

// PATCH - 更新订单状态
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = getUserId(req);
  if (!userId) return errors.unauthorized();

  const result = await parseBody(req, updateStatusSchema);
  if ('error' in result) return result.error;
  const { action } = result.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        item: {
          select: { sellerId: true },
        },
      },
    });

    if (!order) return errors.notFound('订单不存在');

    const isBuyer = order.buyerId === userId;
    const isSeller = order.item.sellerId === userId;

    if (!isBuyer && !isSeller) {
      return errors.forbidden();
    }

    let nextStatus = order.status;

    switch (action) {
      case 'pay':
        if (!isBuyer) return errors.forbidden('只有买家可以支付');
        if (order.status !== 'pending') return errors.badRequest('订单状态错误');
        nextStatus = 'paid';
        break;

      case 'ship':
        if (!isSeller) return errors.forbidden('只有卖家可以发货');
        if (order.status !== 'paid') return errors.badRequest('订单未支付或已发货');
        nextStatus = 'shipped';
        break;

      case 'confirm':
        if (!isBuyer) return errors.forbidden('只有买家可以确认收货');
        if (order.status !== 'shipped') return errors.badRequest('订单未发货');
        nextStatus = 'completed';
        break;

      case 'cancel':
        if (order.status === 'completed' || order.status === 'cancelled') {
          return errors.badRequest('订单已结束');
        }
        if (order.status === 'pending' || (order.status === 'paid' && isSeller)) {
          nextStatus = 'cancelled';
        } else {
          return errors.badRequest('无法取消当前状态的订单');
        }
        break;
    }

    if (nextStatus !== order.status) {
      if (nextStatus === 'cancelled') {
        // 取消订单需要恢复物品状态
        await prisma.$transaction([
          prisma.order.update({
            where: { id },
            data: { status: nextStatus },
          }),
          prisma.item.update({
            where: { id: order.itemId },
            data: { status: 'available' },
          }),
        ]);
      } else {
        await prisma.order.update({
          where: { id },
          data: { status: nextStatus },
        });
      }
    }

    return successResponse({ status: nextStatus });
  } catch (err) {
    console.error('Update order error:', err);
    return errors.internal('更新订单状态失败');
  }
}
