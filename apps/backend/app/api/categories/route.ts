import { successResponse, errors } from '@/lib';

// 硬编码的分类列表 (简化版本,无需数据库)
const CATEGORIES = [
  { id: '1', name: '电子数码', icon: '📱' },
  { id: '2', name: '服饰鞋包', icon: '👔' },
  { id: '3', name: '书籍教材', icon: '📚' },
  { id: '4', name: '生活用品', icon: '🏠' },
  { id: '5', name: '运动户外', icon: '⚽' },
  { id: '6', name: '美妆护肤', icon: '💄' },
  { id: '7', name: '其他', icon: '📦' },
];

// 获取分类列表
export async function GET() {
  try {
    return successResponse(CATEGORIES);
  } catch (error) {
    console.error('Get categories error:', error);
    return errors.internal('获取分类列表失败');
  }
}
