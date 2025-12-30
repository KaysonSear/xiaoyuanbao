export interface Category {
  id: string;
  name: string;
  icon?: string;
  parentId?: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  condition: string;
  status: string;
  category: string;
  createdAt: string;
  seller: {
    id: string;
    nickname: string;
    avatar?: string;
  };
}

export interface Order {
  id: string;
  itemId: string;
  item: Item;
  buyerId: string;
  buyer: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  amount: number;
  status: 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
