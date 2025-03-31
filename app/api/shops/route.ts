import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SHOP_OWNER") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { name, address, phone, email, description } = data;

    // Check if user already has a shop
    const existingShop = await prisma.shop.findUnique({
      where: { ownerId: session.user.id },
    });

    if (existingShop) {
      return NextResponse.json(
        { error: "You already have a registered shop" },
        { status: 400 }
      );
    }

    const shop = await prisma.shop.create({
      data: {
        name,
        address,
        phone,
        email,
        description,
        ownerId: session.user.id,
        isApproved: false, // Admin needs to approve the shop
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Error creating shop:", error);
    return NextResponse.json(
      { error: "Failed to create shop" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let shops;
    if (session.user.role === "ADMIN") {
      // Admin can see all shops
      shops = await prisma.shop.findMany({
        include: {
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
          services: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (session.user.role === "SHOP_OWNER") {
      // Shop owner can only see their own shop
      shops = await prisma.shop.findMany({
        where: {
          ownerId: session.user.id,
        },
        include: {
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
          services: true,
        },
      });
    } else {
      // Customers can only see approved shops
      shops = await prisma.shop.findMany({
        where: {
          isApproved: true,
        },
        include: {
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
          services: true,
        },
      });
    }

    console.log("Fetched shops for role:", session.user.role, shops); // Debug log
    return NextResponse.json(shops);
  } catch (error) {
    console.error("Error fetching shops:", error);
    return NextResponse.json(
      { error: "Failed to fetch shops" },
      { status: 500 }
    );
  }
} 