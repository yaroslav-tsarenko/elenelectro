import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString =
  process.env.DIRECT_URL ||
  "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const storeSettings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "My Store",
      email: "store@example.com",
      currency: "EUR",
      taxRate: 21,
      freeShippingMin: 50,
    },
  });
  console.log("Store settings:", storeSettings.name);

  const categories = await Promise.all(
    [
      { name: "Electronics", slug: "electronics", description: "Gadgets, devices, and more" },
      { name: "Clothing", slug: "clothing", description: "Fashion and apparel" },
      { name: "Home & Garden", slug: "home-garden", description: "Everything for your home" },
      { name: "Sports", slug: "sports", description: "Sports equipment and gear" },
    ].map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: { ...cat, isActive: true, sortOrder: 0 },
      })
    )
  );
  console.log(`Created ${categories.length} categories`);

  // Test users
  // test@gmail.com / test123! — Customer with $10,000 budget
  // admin@gmail.com / admin123! — Admin user
  const testPassword = await bcrypt.hash("test123!", 12);
  const adminPassword = await bcrypt.hash("admin123!", 12);

  const testUser = await prisma.user.upsert({
    where: { email: "test@gmail.com" },
    update: { passwordHash: testPassword },
    create: {
      email: "test@gmail.com",
      passwordHash: testPassword,
      name: "Test Customer",
      role: "CUSTOMER",
    },
  });
  console.log(`Created test user: ${testUser.email} (role: ${testUser.role})`);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: { passwordHash: adminPassword },
    create: {
      email: "admin@gmail.com",
      passwordHash: adminPassword,
      name: "Store Admin",
      role: "ADMIN",
    },
  });
  console.log(`Created admin user: ${adminUser.email} (role: ${adminUser.role})`);

  const page = await prisma.page.upsert({
    where: { slug: "about-us" },
    update: {},
    create: {
      title: "About Us",
      slug: "about-us",
      content:
        "<p>Welcome to My Store! We are dedicated to providing quality products at competitive prices.</p><p>Founded in 2024, we have been serving customers worldwide with a focus on sustainability and customer satisfaction.</p>",
      isActive: true,
    },
  });
  console.log(`Created page: ${page.title}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
