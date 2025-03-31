import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH method: Update shop approval status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { isApproved } = data || {};
    if (typeof isApproved !== "boolean") {
      return NextResponse.json(
        { error: "Invalid data: isApproved must be a boolean" },
        { status: 400 }
      );
    }

    const shop = await prisma.shop.update({
      where: { id: params.id },
      data: { isApproved },
    });

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Error updating shop:", error);
    return NextResponse.json(
      { error: "Failed to update shop" },
      { status: 500 }
    );
  }
}

// GET method: Fetch shop details
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: params.id },
      include: {
        services: true, // Include related services if needed
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(shop);
  } catch (error) {
    console.error("Error fetching shop details:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop details" },
      { status: 500 }
    );
  }
}