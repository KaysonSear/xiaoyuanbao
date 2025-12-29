import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, successResponse, errors, parseBody, env } from '@/lib';

const loginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  password: z.string().min(6, '密码至少需要6位'),
});

export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const result = await parseBody(request, loginSchema);
    if ('error' in result) {
      return result.error;
    }
    const { phone, password } = result.data;

    // 2. 查找用户
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.passwordHash) {
      return errors.unauthorized('手机号或密码错误');
    }

    // 3. 验证密码
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return errors.unauthorized('手机号或密码错误');
    }

    // 4. 生成 JWT Token
    // 使用与 register/me 相同的 secret 和 fallback 逻辑
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET || 'fallback-secret-for-dev', {
      expiresIn: '7d',
    });

    // 5. 返回结果 (不返回密码hash)
    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

    return successResponse({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errors.internal('登录失败，请稍后重试');
  }
}
