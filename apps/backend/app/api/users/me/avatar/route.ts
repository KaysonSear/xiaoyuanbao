import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma, successResponse, errors, requireUser, parseBody } from '@/lib';

// Base64 图片上传 Schema
const avatarUploadSchema = z.object({
  // 支持 data:image/xxx;base64,xxx 格式或纯 base64
  avatar: z
    .string()
    .min(1, '头像数据不能为空')
    .refine(
      (val) => {
        // 检查是否是 data URL 或有效的 base64
        if (val.startsWith('data:image/')) {
          return true;
        }
        // 检查是否是有效的 base64 字符串
        try {
          return Buffer.from(val, 'base64').toString('base64') === val;
        } catch {
          return false;
        }
      },
      { message: '无效的图片格式' }
    ),
});

/**
 * POST /api/users/me/avatar
 * 上传用户头像 (Base64)
 *
 * 请求体:
 * {
 *   "avatar": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = requireUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { userId } = authResult;

    // 解析请求体
    const result = await parseBody(request, avatarUploadSchema);
    if ('error' in result) {
      return result.error;
    }

    let { avatar } = result.data;

    // 如果不是 data URL 格式,添加默认前缀
    if (!avatar.startsWith('data:image/')) {
      avatar = `data:image/jpeg;base64,${avatar}`;
    }

    // 检查图片大小 (限制 2MB)
    const sizeInBytes = Buffer.from(avatar.split(',')[1] || avatar, 'base64').length;
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (sizeInBytes > maxSize) {
      return errors.badRequest(`图片过大,最大支持 ${maxSize / 1024 / 1024}MB`);
    }

    // 更新用户头像
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    console.error('Avatar upload error:', error);
    return errors.internal('头像上传失败');
  }
}

/**
 * DELETE /api/users/me/avatar
 * 删除用户头像
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = requireUser(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    const { userId } = authResult;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: {
        id: true,
        nickname: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return successResponse(user);
  } catch (error) {
    console.error('Delete avatar error:', error);
    return errors.internal('删除头像失败');
  }
}
