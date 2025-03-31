import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      role: UserRole.ADMIN,
      phone: "1234567890",
    },
  });

  // Create shop owner
  const shopOwnerPassword = await hash("shop123", 12);
  const shopOwner = await prisma.user.upsert({
    where: { email: "shop@example.com" },
    update: {},
    create: {
      email: "shop@example.com",
      password: shopOwnerPassword,
      name: "Shop Owner",
      role: UserRole.SHOP_OWNER,
      phone: "1234567891",
    },
  });

  // Create customer
  const customerPassword = await hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      password: customerPassword,
      name: "Customer User",
      role: UserRole.CUSTOMER,
      phone: "1234567892",
    },
  });

  // Create shop
  const shop = await prisma.shop.upsert({
    where: { id: "test-shop" },
    update: {},
    create: {
      id: "test-shop",
      name: "Test Laundry Shop",
      address: "123 Test Street",
      phone: "1234567893",
      email: "shop@example.com",
      description: "A test laundry shop",
      isApproved: true,
      ownerId: shopOwner.id,
    },
  });

  // Create services
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: "wash" },
      update: {},
      create: {
        id: "wash",
        name: "Wash",
        description: "Basic washing service",
        price: 10.00,
        shopId: shop.id,
      },
    }),
    prisma.service.upsert({
      where: { id: "dry" },
      update: {},
      create: {
        id: "dry",
        name: "Dry",
        description: "Drying service",
        price: 8.00,
        shopId: shop.id,
      },
    }),
    prisma.service.upsert({
      where: { id: "iron" },
      update: {},
      create: {
        id: "iron",
        name: "Iron",
        description: "Ironing service",
        price: 5.00,
        shopId: shop.id,
      },
    }),
  ]);

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 