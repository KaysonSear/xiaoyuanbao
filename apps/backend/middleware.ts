import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 需要保护的路由前缀
const PROTECTED_PREFIXES = ['/api'];

// 公开路由 (不需要登录)
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/users/login',
  '/api/users/register',
  '/api/health',
  '/api/categories', // 分类列表通常公开
];

// 部分公开的路由 (如GET请求公开, POST需登录)
// 格式: { pathPrefix: string, methods: string[] }
const PARTIALLY_PUBLIC_PATHS = [
  { pathPrefix: '/api/items', methods: ['GET'] }, // 物品列表和详情公开
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 检查是否是受保护的路径
  const isProtectedPath = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // 2. 检查是否是完全公开的路径
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }

  // 3. 检查是否是部分公开的路径 (如只公开GET)
  const isPartiallyPublic = PARTIALLY_PUBLIC_PATHS.some((config) => {
    if (pathname === config.pathPrefix || pathname.startsWith(config.pathPrefix + '/')) {
      return config.methods.includes(request.method);
    }
    return false;
  });

  if (isPartiallyPublic) {
    return NextResponse.next();
  }

  // 4. 验证 Token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ code: 401, message: '请先登录', data: null }, { status: 401 });
  }

  try {
    // 获取 JWT Secret (注意: middleware 中 process.env 可能需要特殊处理, 但在 Next.js 16 中通常可以直接访问)
    // 如果使用了 runtime env 验证库 (如 t3-env), 确保它是 edge compatible 的
    // 这里简单起见直接读取 process.env, 且提供 fallback (但在生产环境必须有)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev');

    const { payload } = await jwtVerify(token, secret);

    // 5. 验证通过, 将 userId 注入 request headers 供后续路由使用
    const requestHeaders = new Headers(request.headers);
    if (payload.userId && typeof payload.userId === 'string') {
      requestHeaders.set('x-user-id', payload.userId);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json(
      { code: 401, message: '登录已过期或无效', data: null },
      { status: 401 }
    );
  }
}

// 配置匹配路径
export const config = {
  matcher: [
    // 匹配所有 /api 开头的路径
    '/api/:path*',
  ],
};
