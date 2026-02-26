import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  FileText,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Share2,
  RefreshCw,
} from "lucide-react";
import orderService from "../services/orderService";
import productService from "../services/productService";
import userService from "../services/userService";
import { formatCurrency, formatPercentage } from "../utils/formatters";

const AUTO_REFRESH_INTERVAL = 15000;

function Reports() {
  const [reportData, setReportData] = useState(null);
  const [timeRange, setTimeRange] = useState("month");
  const [reportType, setReportType] = useState("sales");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getDateRange = (range) => {
    const end = new Date();
    const start = new Date();
    if (range === "week") start.setDate(end.getDate() - 7);
    if (range === "month") start.setMonth(end.getMonth() - 1);
    if (range === "quarter") start.setMonth(end.getMonth() - 3);
    if (range === "year") start.setFullYear(end.getFullYear() - 1);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  };

  // Wrap loadReportData in useCallback to avoid infinite re-renders
  const loadReportData = useCallback(async (showRefresh = false, silent = false) => {
    if (showRefresh) setRefreshing(true);
    if (!silent) setIsLoading(true);

    try {
      const { startDate, endDate } = getDateRange(timeRange);
      const [dashboardRes, statsRes, analyticsRes, usersRes, productsRes] =
        await Promise.all([
          orderService.getDashboardStats(timeRange),
          orderService.getOrderStats(timeRange),
          orderService.getRevenueAnalytics(startDate, endDate),
          userService.getUsers({ limit: 1 }),
          productService.getAllProducts({ limit: 200 }),
        ]);

      const dashboard = dashboardRes.success ? dashboardRes.data : {};
      const overview = dashboard.overview || {};
      const orderStats = statsRes.success ? statsRes.data : {};
      const dailySales = analyticsRes.success ? analyticsRes.data?.dailySales || [] : [];
      const allProducts = productsRes.success ? productsRes.data || [] : [];

      const categoryMap = allProducts.reduce((acc, product) => {
        const key = product.category || "Uncategorized";
        const existing = acc[key] || { category: key, count: 0, revenue: 0 };
        existing.count += 1;
        existing.revenue += Number(product.price || 0);
        acc[key] = existing;
        return acc;
      }, {});
      const totalProductsCount = Math.max(allProducts.length, 1);

      const categoryDistribution = Object.values(categoryMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((item, idx) => {
          const percentage = Number(
            ((item.count / totalProductsCount) * 100).toFixed(1),
          );
          return {
            category: item.category,
            count: item.count,
            revenue: item.revenue,
            value: percentage,
            color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"][idx],
          };
        });

      const topProducts = (orderStats.topProducts || []).map((product) => ({
        name: product.productName || product.name || "Unknown",
        sales: product.quantity || 0,
        revenue: product.revenue || 0,
      }));

      const enhancedData = {
        salesReport: {
          totalSales: overview.totalRevenue || 0,
          totalOrders: overview.totalOrders || 0,
          avgOrderValue:
            overview.totalOrders > 0
              ? (overview.totalRevenue || 0) / overview.totalOrders
              : 0,
          growth: Number(overview.growthRate || 0),
        },
        performanceReport: {
          topProducts,
          topCategories: categoryDistribution.map((item) => ({
            category: item.category,
            revenue: item.revenue,
            growth: 0,
          })),
        },
        metrics: {
          totalRevenue: overview.totalRevenue || 0,
          totalOrders: overview.totalOrders || 0,
          avgOrderValue:
            overview.totalOrders > 0
              ? (overview.totalRevenue || 0) / overview.totalOrders
              : 0,
          growth: Number(overview.growthRate || 0),
          customerGrowth: Number(overview.totalUsers || 0),
          inventoryTurnover: Number(overview.totalProducts || 0),
          conversionRate:
            overview.totalOrders > 0
              ? ((orderStats.completedOrders || 0) / overview.totalOrders) * 100
              : 0,
          totalUsers: Number(overview.totalUsers || 0),
        },
        timeSeries: dailySales.map((item) => ({
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          revenue: item.sales || 0,
          orders: 0,
          profit: item.sales ? item.sales * 0.3 : 0,
        })),
        categoryDistribution,
        totalUsers: usersRes.success ? usersRes.pagination?.total || 0 : 0,
        generatedAt: new Date().toISOString(),
      };

      setReportData(enhancedData);
    } catch (error) {
      console.error("Failed to load report data:", error);
      setReportData((prev) =>
        prev || {
          salesReport: {
            totalSales: 0,
            totalOrders: 0,
            avgOrderValue: 0,
            growth: 0,
          },
          performanceReport: {
            topProducts: [],
            topCategories: [],
          },
          metrics: {
            totalRevenue: 0,
            totalOrders: 0,
            avgOrderValue: 0,
            growth: 0,
            customerGrowth: 0,
            inventoryTurnover: 0,
            conversionRate: 0,
            totalUsers: 0,
          },
          timeSeries: [],
          categoryDistribution: [],
          totalUsers: 0,
          generatedAt: new Date().toISOString(),
        },
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]); // Add timeRange as dependency

  useEffect(() => {
    loadReportData(false, false);
    const timer = setInterval(() => {
      loadReportData(false, true);
    }, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [loadReportData]); // Now loadReportData is stable

  const exportReport = (format) => {
    if (format === "pdf") {
      alert(
        "PDF export would be generated here. This could use jsPDF or similar library."
      );
    } else if (format === "excel") {
      alert("Excel export would be generated here.");
    } else {
      alert("Report exported successfully!");
    }
  };

  const printReport = () => {
    window.print();
  };

  const getGrowthColor = (value) => {
    return value >= 0 ? "text-emerald-600" : "text-red-600";
  };

  const getGrowthIcon = (value) => {
    return value >= 0 ? (
      <ArrowUpRight className="w-4 h-4" />
    ) : (
      <ArrowDownRight className="w-4 h-4" />
    );
  };

  if (isLoading || !reportData) {
    return (
      <div className="p-6 md:p-12 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Generating reports...</p>
        </div>
      </div>
    );
  }

  const maxSeriesRevenue = Math.max(
    ...reportData.timeSeries.map((point) => Number(point.revenue || 0)),
    1,
  );

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-slate-500 mt-1">
            Comprehensive insights and performance metrics.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportReport("pdf")}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-red-600/20"
          >
            <Download size={18} />
            Export PDF
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-slate-600/20"
          >
            <Printer size={18} />
            Print
          </button>
          <button
            onClick={() => loadReportData(true, true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900">Report Period</h3>
            <p className="text-slate-500 text-sm">
              Select time range for analysis
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              {["week", "month", "quarter", "year"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                    timeRange === range
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <Calendar size={18} />
              Custom Range
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${getGrowthColor(
                reportData.metrics.growth
              )}`}
            >
              {getGrowthIcon(reportData.metrics.growth)}
              {formatPercentage(reportData.metrics.growth)}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(reportData.metrics.totalRevenue)}
          </p>
          <p className="text-sm text-slate-500 mt-1">Total Revenue</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-emerald-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${getGrowthColor(
                reportData.metrics.growth
              )}`}
            >
              {getGrowthIcon(reportData.metrics.growth)}
              {formatPercentage(reportData.metrics.growth)}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {reportData.metrics.totalOrders.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500 mt-1">Total Orders</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${getGrowthColor(
                reportData.metrics.conversionRate
              )}`}
            >
              {getGrowthIcon(reportData.metrics.conversionRate)}
              {formatPercentage(reportData.metrics.conversionRate)}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {(reportData.metrics.totalUsers || reportData.totalUsers || 0).toLocaleString()}
          </p>
          <p className="text-sm text-slate-500 mt-1">Total Customers</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${getGrowthColor(
                reportData.metrics.growth
              )}`}
            >
              {getGrowthIcon(reportData.metrics.growth)}
              {formatPercentage(reportData.metrics.growth)}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(reportData.metrics.avgOrderValue || 0)}
          </p>
          <p className="text-sm text-slate-500 mt-1">Avg. Order Value</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900">Revenue Trends</h3>
              <p className="text-slate-500 text-sm">Performance over time</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert("Share report functionality")}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Share2 size={16} />
                Share
              </button>
              <button
                onClick={() => alert("View detailed report")}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Eye size={16} />
                Details
              </button>
            </div>
          </div>

          <div className="h-64">
            {/* Simplified chart visualization */}
            <div className="flex items-end justify-between h-48 mt-4">
              {reportData.timeSeries.slice(-7).map((point, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 px-1"
                >
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg"
                    style={{
                      height: `${(Number(point.revenue || 0) / maxSeriesRevenue) * 100}%`,
                    }}
                  ></div>
                  <span className="text-xs text-slate-500 mt-2">
                    {point.date}
                  </span>
                  <span className="text-xs font-medium mt-1">
                    {formatCurrency(point.revenue).replace("$", "")}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm text-slate-600">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-slate-600">Profit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-sm text-slate-600">Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900">
                Category Distribution
              </h3>
              <p className="text-slate-500 text-sm">Revenue by category</p>
            </div>
            <PieChart className="w-6 h-6 text-slate-400" />
          </div>

          <div className="space-y-4">
            {reportData.categoryDistribution.map((category, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-slate-700">{category.category}</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {category.value}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${category.value}%`,
                      backgroundColor: category.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Categories</span>
              <span className="font-medium text-slate-900">
                {reportData.categoryDistribution.length}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-slate-600">Top Category</span>
              <span className="font-medium text-slate-900">
                {reportData.categoryDistribution[0]?.category || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Top Products</h3>
                <p className="text-slate-500 text-sm">Best selling items</p>
              </div>
              <BarChart3 className="w-6 h-6 text-slate-400" />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {reportData.performanceReport.topProducts.map((product, index) => (
              <div
                key={index}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {product.sales} units sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {formatCurrency(product.revenue)}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Real-time data
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Top Categories</h3>
                <p className="text-slate-500 text-sm">Revenue by category</p>
              </div>
              <TrendingUp className="w-6 h-6 text-slate-400" />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {reportData.performanceReport.topCategories.map(
              (category, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                        {category.category.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {category.category}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatCurrency(category.revenue)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {formatPercentage(category.growth)}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        {category.growth >= 0 ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-red-600" />
                        )}
                        <span
                          className={
                            category.growth >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }
                        >
                          vs last period
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900">Report Types</h3>
            <p className="text-slate-500 text-sm">
              Select report type to generate
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: "sales", label: "Sales", icon: DollarSign },
              { id: "inventory", label: "Inventory", icon: Package },
              { id: "customer", label: "Customer", icon: Users },
              { id: "financial", label: "Financial", icon: FileText },
            ].map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
                    reportType === type.id
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Report Summary */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Report Summary</h3>
            <p className="text-slate-300 mb-4">
              This {timeRange}ly report shows strong performance across all key
              metrics. Revenue grew by{" "}
              {formatPercentage(reportData.metrics.growth)} compared to the
              previous period.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Period</p>
                <p className="font-medium capitalize">{timeRange}ly</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Generated</p>
                <p className="font-medium">
                  {new Date(reportData.generatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Status</p>
                <p className="font-medium text-emerald-400">Complete</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Pages</p>
                <p className="font-medium">12</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => exportReport("pdf")}
              className="flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Download size={18} />
              Download Full Report
            </button>
            <button
              onClick={printReport}
              className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Printer size={18} />
              Print Summary
            </button>
          </div>
        </div>
      </div>

      {/* Generated Date */}
      <div className="text-center text-sm text-slate-500">
        Report generated on {new Date(reportData.generatedAt).toLocaleString()}
      </div>
    </div>
  );
}

export default Reports;
