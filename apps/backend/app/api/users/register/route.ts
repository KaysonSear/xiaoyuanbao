import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma, successResponse, errors } from '@/lib';

// 注册请求 schema
const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式错误'),
  password: z.string().min(6, '密码至少6位').max(32, '密码最多32位'),
  nickname: z.string().min(2, '昵称至少2个字符').max(20, '昵称最多20个字符'),
  verifyCode: z.string().length(6, '验证码为6位数字').optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { phone, password, nickname } = parsed.data;

    // 检查手机号是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return errors.badRequest('该手机号已注册');
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 12);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        nickname,
        creditScore: 100,
        creditLevel: '普通',
        ecoPoints: 0,
      },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        isVerified: true,
        creditScore: true,
        createdAt: true,
      },
    });

    return successResponse(user, undefined);
  } catch (error) {
    console.error('Register error:', error);
    return errors.internal('注册失败，请稍后重试');
  }
}

// 获取当前用户信息
export async function GET() {
  // TODO: 从session获取用户ID
  return NextResponse.json({
    success: true,
    message: 'Use /api/auth/session to get current user',
  });
}
