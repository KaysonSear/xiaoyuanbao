import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma, successResponse, errors, env } from '@/lib';

// 从Authorization header提取token
function getTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

// 验证token并返回用户ID
function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET || 'fallback-secret-for-dev') as {
      userId: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) {
      return errors.unauthorized('请先登录');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return errors.unauthorized('登录已过期，请重新登录');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        studentId: true,
        realName: true,
        isVerified: true,
        creditScore: true,
        creditLevel: true,
        ecoPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return errors.notFound('用户不存在');
    }

    return successResponse(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return errors.internal('获取用户信息失败');
  }
}

// 更新用户信息
export async function PATCH(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request);
    if (!token) {
      return errors.unauthorized('请先登录');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return errors.unauthorized('登录已过期，请重新登录');
    }

    const body = await request.json();
    const allowedFields = ['nickname', 'avatar'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return errors.badRequest('没有要更新的字段');
    }

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        isVerified: true,
        creditScore: true,
        updatedAt: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    console.error('Update profile error:', error);
    return errors.internal('更新用户信息失败');
  }
}
