export interface Category {
  id: string;
  name: string;
  icon?: string;
  parentId?: string;
}

export interface Item {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  condition: string;
  status: string;
  type: string;
  views: number;
  createdAt: string;
  seller: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
}
