import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const [
      todayOrders,
      yesterdayOrders,
      thisMonthOrders,
      lastMonthOrders,
      totalProducts,
      totalCustomers,
      recentOrders,
      lowStockProducts,
      ordersByStatus,
      totalOrders,
      totalRevenue,
      revenueByDay,
      topProducts,
      categoryStats,
      recentCustomers,
      reviewStats,
      weeklyOrders,
    ] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: today } },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: yesterday, lt: today } },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: thisMonthStart } },
        select: { total: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
        select: { total: true },
      }),
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.product.findMany({
        where: {
          status: "ACTIVE",
          trackInventory: true,
          quantity: { lte: 10 },
        },
        select: { id: true, name: true, sku: true, quantity: true, lowStockAlert: true, price: true },
        orderBy: { quantity: "asc" },
        take: 10,
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      prisma.order.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: last30Days }, paymentStatus: "PAID" },
        _sum: { total: true },
        _count: true,
      }),
      prisma.orderItem.groupBy({
        by: ["productId", "productName"],
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 10,
      }),
      prisma.category.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.user.findMany({
        where: { role: "CUSTOMER" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: { select: { orders: true, reviews: true } },
        },
      }),
      prisma.review.groupBy({
        by: ["rating"],
        _count: true,
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: last7Days } },
        select: { total: true, createdAt: true, status: true },
      }),
    ]);

    const todayRevenue = todayOrders.reduce(
      (sum: number, order: { total: unknown }) => sum + Number(order.total), 0
    );
    const yesterdayRevenue = yesterdayOrders.reduce(
      (sum: number, order: { total: unknown }) => sum + Number(order.total), 0
    );
    const thisMonthRevenue = thisMonthOrders.reduce(
      (sum: number, order: { total: unknown }) => sum + Number(order.total), 0
    );
    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum: number, order: { total: unknown }) => sum + Number(order.total), 0
    );

    const avgOrderValue = totalOrders > 0
      ? Number(totalRevenue._sum.total || 0) / totalOrders
      : 0;

    const productsByStock = await prisma.product.groupBy({
      by: ["status"],
      _count: true,
    });

    const stockDistribution = {
      outOfStock: await prisma.product.count({ where: { status: "ACTIVE", quantity: 0 } }),
      lowStock: await prisma.product.count({ where: { status: "ACTIVE", quantity: { gt: 0, lte: 10 } } }),
      inStock: await prisma.product.count({ where: { status: "ACTIVE", quantity: { gt: 10 } } }),
    };

    return NextResponse.json({
      todayOrders: todayOrders.length,
      todayRevenue,
      yesterdayOrders: yesterdayOrders.length,
      yesterdayRevenue,
      thisMonthOrders: thisMonthOrders.length,
      thisMonthRevenue,
      lastMonthOrders: lastMonthOrders.length,
      lastMonthRevenue,
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.total || 0),
      avgOrderValue,
      recentOrders,
      lowStockProducts,
      ordersByStatus,
      revenueByDay,
      topProducts,
      categoryStats,
      recentCustomers,
      reviewStats,
      weeklyOrders,
      productsByStock,
      stockDistribution,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
