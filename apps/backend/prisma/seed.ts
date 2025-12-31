import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['query'],
});

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Clean existing data
  await prisma.favorite.deleteMany();
  await prisma.message.deleteMany();
  await prisma.order.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned database');

  // 2. Create Users
  const passwordHash = await bcrypt.hash('123456', 10);

  const usersData = Array.from({ length: 5 }).map((_, i) => ({
    phone: `1380013800${i}`,
    passwordHash,
    nickname: `Student${i + 1}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Student${i + 1}`,
    school: i % 2 === 0 ? '清华大学' : '北京大学',
  }));

  const users = await Promise.all(usersData.map((data) => prisma.user.create({ data })));

  console.log(`👤 Created ${users.length} users`);

  // 3. Create Items
  // 使用与前端一致的中文分类名
  const categoryItems = [
    // 电子数码
    { category: '电子数码', title: 'iPhone 14 Pro 256G 深空黑', price: 5999, condition: '99新' },
    { category: '电子数码', title: 'MacBook Air M2 256G', price: 6800, condition: '98新' },
    { category: '电子数码', title: 'AirPods Pro 2代 降噪', price: 899, condition: '95新' },
    { category: '电子数码', title: 'iPad Pro 2022 11寸', price: 4500, condition: '99新' },
    { category: '电子数码', title: '索尼WH-1000XM5耳机', price: 1599, condition: '全新' },
    { category: '电子数码', title: '罗技G Pro无线鼠标', price: 450, condition: '9成新' },
    // 书籍教材
    { category: '书籍教材', title: '考研数学全书张宇18讲', price: 35, condition: '9成新' },
    { category: '书籍教材', title: 'C++ Primer Plus 第6版', price: 45, condition: '8成新' },
    { category: '书籍教材', title: '高等数学同济第七版', price: 25, condition: '9成新' },
    { category: '书籍教材', title: '英语六级真题解析', price: 20, condition: '全新' },
    // 服饰鞋包
    { category: '服饰鞋包', title: 'Nike Air Jordan 1 熊猫', price: 650, condition: '99新' },
    { category: '服饰鞋包', title: '阿迪达斯运动T恤', price: 89, condition: '全新' },
    { category: '服饰鞋包', title: "Levi's 501牛仔裤", price: 199, condition: '95新' },
    { category: '服饰鞋包', title: '北面冲锋衣黑色M码', price: 399, condition: '9成新' },
    // 生活用品
    { category: '生活用品', title: '小米台灯Pro护眼灯', price: 89, condition: '全新' },
    { category: '生活用品', title: '戴森吹风机HD08', price: 1800, condition: '99新' },
    { category: '生活用品', title: '米家电饭煲3L', price: 150, condition: '9成新' },
    { category: '生活用品', title: '宜家办公椅白色', price: 299, condition: '8成新' },
    // 运动户外
    { category: '运动户外', title: '尤尼克斯羽毛球拍', price: 280, condition: '95新' },
    { category: '运动户外', title: '迪卡侬折叠自行车', price: 599, condition: '9成新' },
    { category: '运动户外', title: '斯伯丁篮球7号', price: 120, condition: '全新' },
    { category: '运动户外', title: '李宁跑步鞋飞电3', price: 450, condition: '99新' },
    // 美妆护肤
    { category: '美妆护肤', title: 'SK-II神仙水230ml', price: 850, condition: '全新' },
    { category: '美妆护肤', title: '兰蔻小黑瓶精华', price: 680, condition: '全新' },
    { category: '美妆护肤', title: '雅诗兰黛眼霜15ml', price: 320, condition: '99新' },
    // 其他
    { category: '其他', title: '任天堂Switch OLED', price: 1800, condition: '99新' },
    { category: '其他', title: '富士拍立得mini11', price: 450, condition: '全新' },
    { category: '其他', title: '乐高哈利波特城堡', price: 399, condition: '全新' },
  ];

  const itemsData = categoryItems.map((item, i) => {
    const seller = users[i % users.length];
    if (!seller) throw new Error('No seller found');
    return {
      title: item.title,
      description: `闲置转让，${item.title}，成色${item.condition}，非诚勿扰，欢迎咨询！`,
      price: item.price,
      images: [
        `https://picsum.photos/seed/${item.title.slice(0, 5)}${i}/400/400`,
        `https://picsum.photos/seed/${item.title.slice(0, 5)}${i + 100}/400/400`,
      ],
      condition: item.condition,
      category: item.category,
      status: 'available',
      sellerId: seller.id,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
    };
  });

  await prisma.item.createMany({ data: itemsData });
  console.log(`📦 Created ${itemsData.length} items`);

  const allItems = await prisma.item.findMany();

  // 4. Create Favorites (Randomly)
  const favoritesData = [];
  for (const user of users) {
    const randomItems = allItems.sort(() => 0.5 - Math.random()).slice(0, 3);
    for (const item of randomItems) {
      if (!user.id || !item.id) continue;
      favoritesData.push({
        userId: user.id,
        itemId: item.id,
      });
    }
  }

  // Use createMany if supported for relations or simple link table logic,
  // but Favorites has @id, so createMany works if model structure allows.
  // SQLite/Postgres support createMany, MongoDB does too in recent versions.
  // However, prisma schema for mongodb ensures _id, so createMany is fine given `id` map.
  // Actually let's use loop to be safe or createMany with no relations?
  // Prisma `createMany` doesn't support relations, but here we provide IDs.
  await prisma.favorite.createMany({ data: favoritesData });
  console.log(`❤️ Created ${favoritesData.length} favorites`);

  // 5. Create Orders (Randomly)
  // Some items sold
  const itemsToSell = allItems.slice(0, 5);
  for (const item of itemsToSell) {
    const buyer = users.find((u) => u.id !== item.sellerId) || users[0];
    if (!buyer) continue;

    await prisma.order.create({
      data: {
        itemId: item.id,
        buyerId: buyer.id,
        amount: item.price,
        status: 'completed',
        createdAt: new Date(),
      },
    });

    // Update item status
    await prisma.item.update({
      where: { id: item.id },
      data: { status: 'sold' },
    });
  }
  console.log(`🛒 Created ${itemsToSell.length} orders`);

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
