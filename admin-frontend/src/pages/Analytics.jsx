import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  Users,
  ShoppingBag,
  DollarSign,
  Eye,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import toast from "react-hot-toast";
import orderService from "../services/orderService";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../utils/formatters";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#6b7280",
];

const AUTO_REFRESH_INTERVAL = 15000;

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [analyticsData, setAnalyticsData] = useState({
    revenueData: [],
    trafficSources: [],
    metrics: {},
    topProducts: [],
    orderStats: {},
    lastUpdated: null,
  });

  const getDateRange = (range) => {
    const end = new Date();
    const start = new Date();

    if (range === "week") start.setDate(end.getDate() - 7);
    if (range === "month") start.setMonth(end.getMonth() - 1);
    if (range === "quarter") start.setMonth(end.getMonth() - 3);
    if (range === "year") start.setFullYear(end.getFullYear() - 1);

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  };

  const fetchAnalyticsData = useCallback(async (showRefresh = false, silent = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else if (!silent) {
        setLoading(true);
      }

      const { startDate, endDate } = getDateRange(timeRange);
      const [orderStatsRes, dashboardRes, revenueRes] = await Promise.all([
        orderService.getOrderStats(timeRange),
        orderService.getDashboardStats(timeRange),
        orderService.getRevenueAnalytics(startDate, endDate),
      ]);

      const orderStats = orderStatsRes.success ? orderStatsRes.data : {};
      const topProducts = (orderStats.topProducts || []).map((product) => ({
        ...product,
        name: product.productName || product.name || "Unknown",
      }));
      const overview = dashboardRes.success ? dashboardRes.data?.overview || {} : {};
      const analytics = revenueRes.success ? revenueRes.data : {};
      const pending = Number(orderStats.pendingOrders || 0);
      const processing = Number(orderStats.processingOrders || 0);
      const completed = Number(orderStats.completedOrders || 0);
      const cancelled = Number(orderStats.cancelledOrders || 0);
      const totalStatuses = Math.max(pending + processing + completed + cancelled, 1);

      const revenueData =
        analytics.dailySales?.map((item) => ({
          month: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          revenue: item.sales || 0,
        })) || [];

      setAnalyticsData({
        revenueData,
        trafficSources: [
          {
            source: "Completed",
            percentage: Number(((completed / totalStatuses) * 100).toFixed(1)),
          },
          {
            source: "Pending",
            percentage: Number(((pending / totalStatuses) * 100).toFixed(1)),
          },
          {
            source: "Processing",
            percentage: Number(((processing / totalStatuses) * 100).toFixed(1)),
          },
          {
            source: "Cancelled",
            percentage: Number(((cancelled / totalStatuses) * 100).toFixed(1)),
          },
        ],
        metrics: {
          pageViews: Number(overview.totalOrders || 0),
          conversion:
            overview.totalOrders > 0
              ? ((orderStats.completedOrders || 0) / overview.totalOrders) * 100
              : 0,
          cancellationRate: Number(orderStats.cancellationRate || 0),
          avgOrderValue: Number(orderStats.avgOrderValue || 0),
        },
        topProducts,
        orderStats,
        lastUpdated: new Date().toISOString(),
      });

      if (showRefresh) {
        toast.success("Analytics refreshed successfully");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error(error.message || "Failed to load analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalyticsData(false, false);
    const timer = setInterval(() => {
      fetchAnalyticsData(false, true);
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchAnalyticsData]);

  const handleRefresh = () => {
    fetchAnalyticsData(true, true);
  };

  const handleExport = () => {
    toast.success("Exporting analytics data...");
    // Implement export logic
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-bold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { revenueData, trafficSources, metrics, topProducts, orderStats, lastUpdated } =
    analyticsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">
            Track your business performance and metrics
          </p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <Calendar size={20} className="text-gray-400" />
          <div className="flex gap-2">
            {["week", "month", "quarter", "year"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-blue-600">
              {formatNumber(orderStats.completedOrders || 0)} completed
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatNumber(metrics.pageViews || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Orders</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-purple-600">Live rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPercentage(metrics.conversion || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Conversion Rate</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-sm text-amber-600">
              {formatNumber(orderStats.cancelledOrders || 0)} cancelled
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatPercentage(metrics.cancellationRate || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Cancellation Rate</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-sm text-emerald-600">
              {formatNumber(orderStats.totalOrders || 0)} orders
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(metrics.avgOrderValue || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Avg. Order Value</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-6">Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis
                  stroke="#64748b"
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-6">Traffic Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="percentage"
                >
                  {trafficSources.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {trafficSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{source.source}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {source.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-6">Order Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { status: "Pending", count: orderStats.pendingOrders || 0 },
                  {
                    status: "Processing",
                    count: orderStats.processingOrders || 0,
                  },
                  { status: "Shipped", count: orderStats.shippedOrders || 0 },
                  {
                    status: "Delivered",
                    count: orderStats.completedOrders || 0,
                  },
                  {
                    status: "Cancelled",
                    count: orderStats.cancelledOrders || 0,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="status" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-6">Top Products</h3>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.quantity || 0} units
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(product.revenue || 0)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                No product data available
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Period Summary</h3>
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm opacity-80">Total Revenue</p>
            <p className="text-xl font-bold">
              {formatCurrency(
                revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0),
              )}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-80">Avg. Order Value</p>
            <p className="text-xl font-bold">
              {formatCurrency(orderStats.avgOrderValue || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-80">Total Orders</p>
            <p className="text-xl font-bold">{orderStats.totalOrders || 0}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Growth Rate</p>
            <p className="text-xl font-bold">
              {formatPercentage(
                orderStats.totalOrders > 0
                  ? ((orderStats.completedOrders || 0) /
                      orderStats.totalOrders) *
                      100
                  : 0,
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
