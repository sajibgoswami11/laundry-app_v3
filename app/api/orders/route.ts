import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Service } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CUSTOMER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { shopId, items, pickupTime, deliveryTime } = body;

    // Validate required fields
    if (!shopId || !items || !pickupTime || !deliveryTime) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return new NextResponse("Invalid items array", { status: 400 });
    }

    // Get shop and validate it exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { services: true },
    });

    if (!shop) {
      return new NextResponse("Shop not found", { status: 404 });
    }

    // Validate all services exist and calculate total
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const service = shop.services.find((s) => s.id === item.serviceId);
      if (!service) {
        return new NextResponse(`Service ${item.serviceId} not found`, {
          status: 400,
        });
      }
      total += service.price * item.quantity;
      orderItems.push({
        serviceId: service.id,
        quantity: item.quantity,
        price: service.price,
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        shopId: shopId,
        total,
        pickupTime: new Date(pickupTime),
        deliveryTime: new Date(deliveryTime),
        status: "PENDING",
        items: {
          create: orderItems,
        },
      },
      include: {
        user: true,
        shop: true,
        items: {
          include: {
            service: true
          }
        }
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
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

    let orders;
    if (session.user.role === "SHOP_OWNER") {
      // Get the shop owned by the user
      const shop = await prisma.shop.findUnique({
        where: { ownerId: session.user.id },
      });

      if (!shop) {
        return NextResponse.json(
          { error: "Shop not found" },
          { status: 404 }
        );
      }

      // Get orders for the shop
      orders = await prisma.order.findMany({
        where: {
          shopId: shop.id,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else if (session.user.role === "CUSTOMER") {
      // Get orders for the customer
      orders = await prisma.order.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          shop: {
            select: {
              name: true,
            },
          },
          items: {
            include: {
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Admin can see all orders
      orders = await prisma.order.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          shop: {
            select: {
              name: true,
            },
          },
          items: {
            include: {
              service: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 