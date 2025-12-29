import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, successResponse, errors, env } from '@/lib';

// 登录请求 schema
const loginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式错误'),
  password: z.string().min(1, '请输入密码'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errors.validation(parsed.error);
    }

    const { phone, password } = parsed.data;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatar: true,
        passwordHash: true,
        isVerified: true,
        creditScore: true,
        creditLevel: true,
        ecoPoints: true,
      },
    });

    if (!user || !user.passwordHash) {
      return errors.unauthorized('用户不存在或密码未设置');
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return errors.unauthorized('密码错误');
    }

    // 生成 JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        phone: user.phone,
      },
      env.JWT_SECRET || 'fallback-secret-for-dev',
      { expiresIn: '7d' }
    );

    // 移除敏感字段
    const { passwordHash: _, ...userWithoutPassword } = user;

    return successResponse({
      user: userWithoutPassword,
      token,
      expiresIn: 7 * 24 * 60 * 60, // 7天(秒)
    });
  } catch (error) {
    console.error('Login error:', error);
    return errors.internal('登录失败，请稍后重试');
  }
}
