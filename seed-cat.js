const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { slug: 'men', imageUrl: '/assets/categories/men.png' },
    { slug: 'women', imageUrl: '/assets/categories/women.png' },
    { slug: 'kids', imageUrl: '/assets/categories/kids.png' }
  ];

  for (const cat of categories) {
    try {
      await prisma.category.update({
        where: { slug: cat.slug },
        data: { imageUrl: cat.imageUrl }
      });
      console.log(`Updated ${cat.slug} with image`);
    } catch (e) {
      console.log(`Failed to update ${cat.slug}: ${e.message}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
