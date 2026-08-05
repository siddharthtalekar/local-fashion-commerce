import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PILOT_CITY_SLUG = process.env.PILOT_CITY_SLUG ?? 'pune';

const STORE_NAMES = [
  'Shree Fashion Hub',
  'Style Street Boutique',
  'Royal Ethnic Wear',
  'Urban Threads',
  'Laxmi Saree Palace',
  'TrendSetters Menswear',
  'Kids Corner Fashion',
  'Heritage Kurti House',
  'Footwear Fiesta',
  'Designer Dupatta World',
  'Camp Fashion Point',
  'Deccan Style Studio',
  'Classic Cotton Co',
  'Boutique 18',
  'Fashion First',
];

const CATEGORIES = [
  { name: 'Ethnic Wear', slug: 'ethnic-wear' },
  { name: 'Western Wear', slug: 'western-wear' },
  { name: 'Footwear', slug: 'footwear' },
  { name: 'Kids', slug: 'kids' },
  { name: 'Accessories', slug: 'accessories' },
];

const BRANDS = [
  'FabIndia',
  'Manyavar',
  'Biba',
  'W',
  'Allen Solly',
  'LocalCraft',
  'Handloom Co',
  'StyleLine',
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const PRODUCT_TITLES = [
  'Cotton Kurta Set',
  'Silk Saree with Blouse',
  'Denim Jacket',
  'Printed Maxi Dress',
  'Formal Shirt',
  'Leather Sandals',
  'Kids Party Wear Set',
  'Embroidered Dupatta',
  'Palazzo Pants',
  'Anarkali Suit',
  'Casual T-Shirt Pack',
  'Designer Lehenga',
  'Sports Shoes',
  'Linen Trousers',
  'Block Print Kurta',
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomPrice(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) / 50) * 50;
}

async function main() {
  console.log('Seeding database...');

  await prisma.intentEvent.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.city.deleteMany();

  const city = await prisma.city.create({
    data: { name: 'Pune', slug: PILOT_CITY_SLUG, state: 'Maharashtra' },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Platform Admin',
      phone: '9999999999',
      passwordHash,
      role: "admin",
      cityId: city.id,
    },
  });

  const categories = await Promise.all(
    CATEGORIES.map((c) => prisma.category.create({ data: c })),
  );

  const brands = await Promise.all(
    BRANDS.map((name) => prisma.brand.create({ data: { name, slug: slugify(name) } })),
  );

  const puneCoords = [
    { lat: 18.5204, lng: 73.8567 },
    { lat: 18.5314, lng: 73.8446 },
    { lat: 18.5074, lng: 73.8077 },
    { lat: 18.5516, lng: 73.9326 },
    { lat: 18.4579, lng: 73.8397 },
  ];

  const stores = [];
  for (let i = 0; i < STORE_NAMES.length; i++) {
    const retailer = await prisma.user.create({
      data: {
        name: `Owner ${STORE_NAMES[i]}`,
        phone: `9876543${String(i).padStart(3, '0')}`,
        passwordHash,
        role: "retailer",
        cityId: city.id,
      },
    });

    const coord = puneCoords[i % puneCoords.length]!;
    const jitter = () => (Math.random() - 0.5) * 0.02;

    const store = await prisma.store.create({
      data: {
        name: STORE_NAMES[i]!,
        slug: slugify(STORE_NAMES[i]!),
        description: `${STORE_NAMES[i]} — your local fashion destination in Pune.`,
        address: `${100 + i}, FC Road, Pune, Maharashtra 411004`,
        cityId: city.id,
        latitude: coord.lat + jitter(),
        longitude: coord.lng + jitter(),
        phone: `9876543${String(i).padStart(3, '0')}`,
        whatsapp: `9876543${String(i).padStart(3, '0')}`,
        coverImageUrl: `https://picsum.photos/seed/store${i}/800/450`,
        categoryTags: JSON.stringify([randomFrom(CATEGORIES).name]),
        openingHours: {
          monday: '10:00 AM - 9:00 PM',
          tuesday: '10:00 AM - 9:00 PM',
          wednesday: '10:00 AM - 9:00 PM',
          thursday: '10:00 AM - 9:00 PM',
          friday: '10:00 AM - 9:30 PM',
          saturday: '10:00 AM - 9:30 PM',
          sunday: '11:00 AM - 8:00 PM',
        },
        verificationStatus: "approved",
        ownerId: retailer.id,
      },
    });
    stores.push(store);
  }

  let productCount = 0;
  for (const store of stores) {
    const numProducts = 8 + Math.floor(Math.random() * 5);
    for (let j = 0; j < numProducts; j++) {
      const title = `${randomFrom(PRODUCT_TITLES)} — ${store.name.split(' ')[0]}`;
      const price = randomPrice(499, 4999);
      const hasDiscount = Math.random() > 0.6;
      const category = randomFrom(categories);
      const brand = randomFrom(brands);

      await prisma.product.create({
        data: {
          title,
          slug: `${slugify(title)}-${productCount}`,
          description: `Premium ${title.toLowerCase()} available at ${store.name}. Visit us to try before you buy.`,
          storeId: store.id,
          categoryId: category.id,
          brandId: brand.id,
          price,
          discountedPrice: hasDiscount ? Math.round(price * 0.85) : null,
          colors: JSON.stringify(['Red', 'Blue', 'Green', 'Black', 'White'].slice(0, 1 + Math.floor(Math.random() * 3))),
          tags: JSON.stringify([category.slug, brand.slug, 'local', 'fashion']),
          searchVector: `${title} ${brand.name} ${category.name}`.toLowerCase(),
          sizes: {
            create: SIZES.slice(0, 3 + Math.floor(Math.random() * 3)).map((size) => ({
              size,
              inStock: Math.random() > 0.2,
            })),
          },
          images: {
            create: [
              { url: `https://picsum.photos/seed/prod${productCount}a/600/800`, sortOrder: 0 },
              { url: `https://picsum.photos/seed/prod${productCount}b/600/800`, sortOrder: 1 },
            ],
          },
        },
      });
      productCount++;
    }
  }

  for (const store of stores.slice(0, 5)) {
    await prisma.offer.create({
      data: {
        title: 'Weekend Special',
        description: '10% off on select items this week',
        type: "percent",
        value: 10,
        storeId: store.id,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`Seeded: city=${city.slug}, stores=${stores.length}, products=${productCount}, admin=${admin.phone}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
