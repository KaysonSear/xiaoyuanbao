import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, successResponse, errors, env } from '@/lib';

// 注册请求 schema
const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式错误'),
  password: z.string().min(6, '密码至少6位').max(32, '密码最多32位'),
  nickname: z.string().min(2, '昵称至少2个字符').max(20, '昵称最多20个字符'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { phone, password, nickname } = parsed.data;

    // 检查手机号是否注册
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
      },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        school: true,
        createdAt: true,
      },
    });

    // 生成 JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
      },
      env.JWT_SECRET || 'fallback-secret-for-dev',
      { expiresIn: '7d' }
    );

    return successResponse({
      user,
      token,
      expiresIn: 7 * 24 * 60 * 60,
    });
  } catch (error) {
    console.error('Register error:', error);
    return errors.internal('注册失败，请稍后重试');
  }
}
