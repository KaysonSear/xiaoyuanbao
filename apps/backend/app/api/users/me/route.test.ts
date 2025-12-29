import { GET, PATCH } from './route';
import { NextRequest, NextResponse } from 'next/server';

// 1. 定义 Mock 函数
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
const mockRequireUser = jest.fn();

// 2. Mock 模块
jest.mock('@/lib', () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
      update: mockUpdate,
    },
  },
  requireUser: mockRequireUser,
  successResponse: (data: any) => NextResponse.json({ code: 200, data }),
  errors: {
    unauthorized: () => NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 }),
    notFound: (msg: string) => NextResponse.json({ code: 404, message: msg }, { status: 404 }),
    internal: (msg: string) => NextResponse.json({ code: 500, message: msg }, { status: 500 }),
    badRequest: (msg: string) => NextResponse.json({ code: 400, message: msg }, { status: 400 }),
  },
}));

describe('User Profile API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/me', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockRequireUser.mockReturnValue({ error: NextResponse.json({ code: 401 }, { status: 401 }) });
      const req = new NextRequest('http://localhost/api/users/me');

      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it('should return 404 if user not found in database', async () => {
      mockRequireUser.mockReturnValue({ userId: 'user-123' });
      mockFindUnique.mockResolvedValue(null);
      const req = new NextRequest('http://localhost/api/users/me');

      const res = await GET(req);
      expect(res.status).toBe(404);
      expect(mockFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-123' },
        })
      );
    });

    it('should return user profile if found', async () => {
      mockRequireUser.mockReturnValue({ userId: 'user-123' });
      const mockUser = { id: 'user-123', nickname: 'Test User', phone: '13800000000' };
      mockFindUnique.mockResolvedValue(mockUser);
      const req = new NextRequest('http://localhost/api/users/me');

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toEqual(mockUser);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update user profile', async () => {
      mockRequireUser.mockReturnValue({ userId: 'user-123' });
      const mockUpdatedUser = { id: 'user-123', nickname: 'New Name' };
      mockUpdate.mockResolvedValue(mockUpdatedUser);

      const req = new NextRequest('http://localhost/api/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ nickname: 'New Name' }),
      });

      const res = await PATCH(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toEqual(mockUpdatedUser);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-123' },
          data: expect.objectContaining({ nickname: 'New Name' }),
        })
      );
    });
  });
});
