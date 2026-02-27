import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { MetricCard } from "../components/MetricCard";
import { RevenueChart } from "../components/RevenueChart";
import { QuickActions } from "../components/QuickActions";
import orderService from "../services/orderService";
import { useAdminRealtimeRefresh } from "../hooks/useAdminRealtimeRefresh";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../utils/formatters";

const AUTO_REFRESH_INTERVAL = 15000;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      revenueTrend: 0,
      orderTrend: 0,
      customerTrend: 0,
      activeBuyersCurrentPeriod: 0,
      conversionRate: 0,
      avgOrderValue: 0,
      growthRate: 0,
      lowStockCount: 0,
      todayRevenue: 0,
      activeSessions: 0,
    },
    recentOrders: [],
    topProducts: [],
    revenueSeries: [],
    systemStatus: {},
    lastUpdated: null,
  });
  const [error, setError] = useState(null);

  const getRangeDates = (range) => {
    const endDate = new Date();
    const startDate = new Date();

    if (range === "day") {
      startDate.setHours(0, 0, 0, 0);
    }
    if (range === "month") {
      startDate.setMonth(endDate.getMonth() - 1);
    }
    if (range === "previousMonth") {
      endDate.setMonth(endDate.getMonth() - 1);
      startDate.setTime(endDate.getTime());
      startDate.setMonth(startDate.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const calculateTrend = (currentValue, previousValue) => {
    const current = Number(currentValue || 0);
    const previous = Number(previousValue || 0);

    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return ((current - previous) / previous) * 100;
  };

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(
    async (showRefresh = false, silent = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else if (!silent) {
          setLoading(true);
        }
        setError(null);

        const monthlyRange = getRangeDates("month");
        const previousMonthlyRange = getRangeDates("previousMonth");
        const dailyRange = getRangeDates("day");

        const [
          ordersRes,
          dashboardRes,
          monthlyRevenueRes,
          previousMonthlyRevenueRes,
          dailyRevenueRes,
          systemRes,
        ] = await Promise.all([
          orderService.getOrders({ limit: 5 }),
          orderService.getDashboardStats("month"),
          orderService.getRevenueAnalytics(
            monthlyRange.startDate,
            monthlyRange.endDate,
          ),
          orderService.getRevenueAnalytics(
            previousMonthlyRange.startDate,
            previousMonthlyRange.endDate,
          ),
          orderService.getRevenueAnalytics(
            dailyRange.startDate,
            dailyRange.endDate,
          ),
          orderService.getSystemStats(),
        ]);

        const dashboard = dashboardRes.success ? dashboardRes.data : {};
        const overview = dashboard.overview || {};
        const productStats = dashboard.productStats || {};
        const userStats = dashboard.userStats || {};
        const orderStats = dashboard.orderStats || {};
        const recentOrders = ordersRes.success ? ordersRes.data : [];
        const dailySales = monthlyRevenueRes.success
          ? monthlyRevenueRes.data?.dailySales || []
          : [];
        const todayRevenue = dailyRevenueRes.success
          ? dailyRevenueRes.data?.totalSales || 0
          : 0;
        const todayOrders = dailyRevenueRes.success
          ? Number(dailyRevenueRes.data?.totalOrders || 0)
          : 0;
        const todayActiveCustomers = dailyRevenueRes.success
          ? Number(dailyRevenueRes.data?.activeCustomers || 0)
          : 0;
        const currentMonthRevenue = monthlyRevenueRes.success
          ? Number(monthlyRevenueRes.data?.totalSales || 0)
          : Number(overview.totalRevenue || 0);
        const previousMonthRevenue = previousMonthlyRevenueRes.success
          ? Number(previousMonthlyRevenueRes.data?.totalSales || 0)
          : 0;
        const currentMonthOrders = monthlyRevenueRes.success
          ? Number(monthlyRevenueRes.data?.totalOrders || 0)
          : Number(overview.totalOrders || 0);
        const previousMonthOrders = previousMonthlyRevenueRes.success
          ? Number(previousMonthlyRevenueRes.data?.totalOrders || 0)
          : 0;
        const activeBuyersCurrentPeriod = monthlyRevenueRes.success
          ? Number(monthlyRevenueRes.data?.activeCustomers || 0)
          : Number(overview.activeCustomers || 0);
        const activeBuyersPreviousPeriod = previousMonthlyRevenueRes.success
          ? Number(previousMonthlyRevenueRes.data?.activeCustomers || 0)
          : 0;
        const systemPayload = systemRes.success ? systemRes.data : {};

        const revenueSeries = dailySales
          .map((item) => ({
            name: new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            value: Number(item.sales || 0),
            profit: Number(item.sales || 0) * 0.3,
          }))
          .slice(-14);

        // Calculate metrics
        const metrics = {
          totalRevenue:
            Number(overview.totalRevenue ?? currentMonthRevenue) || 0,
          totalOrders:
            Number(overview.totalOrders ?? currentMonthOrders) ||
            ordersRes.pagination?.total ||
            0,
          totalCustomers:
            overview.totalCustomers ??
            userStats.regularUsers ??
            userStats.totalUsers ??
            0,
          totalProducts:
            overview.totalProducts ??
            productStats.activeProducts ??
            productStats.totalProducts ??
            0,
          revenueTrend: calculateTrend(
            currentMonthRevenue,
            previousMonthRevenue,
          ),
          orderTrend: calculateTrend(currentMonthOrders, previousMonthOrders),
          customerTrend: calculateTrend(
            activeBuyersCurrentPeriod,
            activeBuyersPreviousPeriod,
          ),
          activeBuyersCurrentPeriod,
          conversionRate:
            currentMonthOrders > 0
              ? ((orderStats.completedOrders || 0) / currentMonthOrders) * 100
              : 0,
          avgOrderValue:
            Number(overview.totalOrders ?? currentMonthOrders) > 0
              ? Number(overview.totalRevenue ?? currentMonthRevenue) /
                Number(overview.totalOrders ?? currentMonthOrders)
              : 0,
          growthRate: Number(overview.growthRate || 0),
          lowStockCount: productStats.lowStockProducts || 0,
          todayRevenue,
          activeSessions: todayActiveCustomers || todayOrders,
        };

        setDashboardData({
          metrics,
          recentOrders: recentOrders.length > 0 ? recentOrders : [],
          topProducts: (orderStats.topProducts || []).map((product) => ({
            ...product,
            name: product.productName || product.name || "Unknown",
          })),
          revenueSeries,
          systemStatus: {
            database: {
              status: systemPayload.database?.status || "Unknown",
              responseTime:
                systemPayload.database?.responseTimeMs !== null &&
                systemPayload.database?.responseTimeMs !== undefined
                  ? `${systemPayload.database.responseTimeMs}ms`
                  : "-",
            },
            server: {
              status: systemPayload.server?.status || "Unknown",
              load: Number(systemPayload.server?.loadAverage?.[0] || 0).toFixed(
                2,
              ),
              cpuCores: Number(systemPayload.server?.cpuCores || 0),
            },
            api: {
              status: systemPayload.api?.status || "Unknown",
              uptime: Number(
                ((systemPayload.performance?.uptime || 0) / 3600).toFixed(1),
              ),
            },
          },
          lastUpdated: new Date().toISOString(),
        });

        if (showRefresh) {
          toast.success("Dashboard refreshed successfully");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message || "Failed to load dashboard data");
        toast.error(error.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchDashboardData(false, false);
    const timer = setInterval(() => {
      fetchDashboardData(false, true);
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  useAdminRealtimeRefresh(
    useCallback(
      (eventData) => {
        const changeType = eventData?.changeType || "";
        if (
          !["order.", "product.", "payment.", "auth."].some((prefix) =>
            changeType.startsWith(prefix),
          )
        ) {
          return;
        }
        fetchDashboardData(false, true);
      },
      [fetchDashboardData],
    ),
    { debounceMs: 600 },
  );

  // Handle refresh
  const handleRefresh = () => {
    fetchDashboardData(true, true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { metrics, recentOrders, topProducts, systemStatus } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
          {dashboardData.lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated:{" "}
              {new Date(dashboardData.lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          trend={`${formatPercentage(metrics.revenueTrend)} vs prev`}
          trendUp={metrics.revenueTrend >= 0}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-blue-500 to-cyan-400"
          delay={0.1}
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(metrics.totalOrders)}
          trend={`${formatPercentage(metrics.orderTrend)} vs prev`}
          trendUp={metrics.orderTrend >= 0}
          icon={ShoppingBag}
          gradient="bg-gradient-to-br from-purple-500 to-pink-400"
          delay={0.2}
        />
        <MetricCard
          title="Total Customers"
          value={formatNumber(metrics.totalCustomers)}
          trend={`${formatNumber(metrics.activeBuyersCurrentPeriod)} buyers this month`}
          trendUp={metrics.customerTrend >= 0}
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-400"
          delay={0.3}
        />
        <MetricCard
          title="Total Products"
          value={formatNumber(metrics.totalProducts)}
          trend={
            metrics.lowStockCount > 0
              ? `${metrics.lowStockCount} low stock`
              : "All in stock"
          }
          trendUp={metrics.lowStockCount === 0}
          icon={Package}
          gradient="bg-gradient-to-br from-amber-500 to-orange-400"
          delay={0.4}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Today's Revenue</p>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp size={16} className="text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(metrics.todayRevenue)}
          </p>
          <p className="text-sm text-green-600 mt-1">Real-time revenue</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Conversion Rate</p>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp size={16} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPercentage(metrics.conversionRate)}
          </p>
          <p className="text-sm text-blue-600 mt-1">Completion performance</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Avg. Order Value</p>
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign size={16} className="text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(metrics.avgOrderValue)}
          </p>
          <p className="text-sm text-purple-600 mt-1">Average order value</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Active Sessions</p>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Users size={16} className="text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(metrics.activeSessions)}
          </p>
          <p className="text-sm text-amber-600 mt-1">Customers active today</p>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - takes 2 columns */}
        <div className="lg:col-span-2">
          <RevenueChart data={dashboardData.revenueSeries} />
        </div>

        {/* Quick Actions - takes 1 column */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="divide-y">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order, index) => (
                <div
                  key={order.id || index}
                  className="px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.orderNumber ||
                          `ORD-${String(order.id ?? "").slice(0, 4)}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customer?.name || "Unknown"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          order.status === "delivered" ||
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status || "pending"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent orders found
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={() => (window.location.href = "/orders")}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Orders →
            </button>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Top Products</h3>
          </div>
          <div className="divide-y">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={index} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {product.quantity || 0} units sold
                        </p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatCurrency(product.revenue || 0)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No product data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Database</p>
              <p className="font-medium text-gray-900">
                {systemStatus.database?.status || "Healthy"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {systemStatus.database?.responseTime || "-"}
              </p>
              <p className="text-xs text-green-600">
                {systemStatus.database?.status || "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Server</p>
              <p className="font-medium text-gray-900">
                {systemStatus.server?.status || "Unknown"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Load:{" "}
                {systemStatus.server?.cpuCores
                  ? `${systemStatus.server?.load} / ${systemStatus.server?.cpuCores}`
                  : "-"}
              </p>
              <p className="text-xs text-green-600">
                {systemStatus.server?.status || "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">API Service</p>
              <p className="font-medium text-gray-900">
                {systemStatus.api?.status || "Unknown"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Uptime: {systemStatus.api?.uptime || 0}h
              </p>
              <p className="text-xs text-green-600">
                {systemStatus.api?.status || "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
