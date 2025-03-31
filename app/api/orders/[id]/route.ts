import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH method: Update order status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SHOP_OWNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Get the shop owner's shop
    const shop = await prisma.shop.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!shop) {
      return new NextResponse("Shop not found", { status: 404 });
    }

    // Verify the order belongs to the shop
    const order = await prisma.order.findFirst({
      where: {
        id: params.id,
        shopId: shop.id,
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ORDER_STATUS_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST method: Create a new order
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CUSTOMER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { shopId, items } = body;

    if (!shopId || !Array.isArray(items) || items.length === 0) {
      return new NextResponse(
        "Invalid data: shopId and items are required",
        { status: 400 }
      );
    }

    // Verify the shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return new NextResponse("Shop not found", { status: 404 });
    }

    // Create the order
    const order = await prisma.order.create({
      data: {
        shopId,
        userId: session.user.id,
        items: {
          create: items.map((item: any) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        total: items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
        pickupTime: new Date(), // Replace with actual pickup time if available
        deliveryTime: new Date(), // Replace with actual delivery time if available
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[ORDER_CREATE_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}