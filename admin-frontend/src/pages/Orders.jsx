import React, { useCallback, useState } from "react";
import { useQuery } from "react-query";
import {
  Search,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import orderService from "../services/orderService";
import { formatCurrency, formatDate } from "../utils/formatters";
import { exportToPDF } from "../utils/exporters";
import { useAdminRealtimeRefresh } from "../hooks/useAdminRealtimeRefresh";
import toast from "react-hot-toast";

const AUTO_REFRESH_INTERVAL = 10000;

function Orders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [exporting, setExporting] = useState(false);

  // Fetch orders
  const { data, isLoading, refetch } = useQuery(
    ["orders", searchQuery, statusFilter],
    () =>
      orderService.getAllOrders({
        search: searchQuery,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
    {
      refetchInterval: AUTO_REFRESH_INTERVAL,
      refetchOnWindowFocus: true,
      keepPreviousData: true,
      onError: (error) => {
        toast.error(error.message || "Failed to load orders");
      },
    },
  );

  // Fetch stats
  const { data: statsData, refetch: refetchStats } = useQuery(
    "orderStats",
    () => orderService.getOrderStats(),
    {
      refetchInterval: AUTO_REFRESH_INTERVAL,
      refetchOnWindowFocus: true,
      onError: (error) => {
        console.error("Failed to load stats:", error);
      },
    },
  );

  const handleRealtimeRefresh = useCallback(
    (eventData) => {
      const changeType = eventData?.changeType || "";
      if (
        !["order.", "product.", "payment.", "auth."].some((prefix) =>
          changeType.startsWith(prefix),
        )
      ) {
        return;
      }
      refetch();
      refetchStats();
    },
    [refetch, refetchStats],
  );

  useAdminRealtimeRefresh(handleRealtimeRefresh, { debounceMs: 500 });

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        toast.success("Order status updated");
        refetch();
        refetchStats();
      }
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      let ordersToExport = selectedOrders;

      // Pull fresh export data from backend only when export is requested.
      if (!ordersToExport.length) {
        const exportResponse = await orderService.getAllOrders({
          page: 1,
          limit: 1000,
          search: searchQuery,
          status: statusFilter !== "all" ? statusFilter : undefined,
        });

        if (!exportResponse.success) {
          throw new Error(exportResponse.error || "Failed to fetch orders");
        }

        ordersToExport = exportResponse.data || [];
      }

      if (!ordersToExport.length) {
        toast.error("No orders available to export");
        return;
      }

      const filenameDate = new Date().toISOString().split("T")[0];
      await exportToPDF(ordersToExport, `orders-report-${filenameDate}.pdf`);
      toast.success("Orders exported as PDF");
    } catch (error) {
      toast.error("Failed to export orders");
    } finally {
      setExporting(false);
    }
  };

  const stats = statsData?.data || {
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
  };

  const statsCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "bg-blue-500",
    },
    {
      title: "Pending",
      value: stats.pendingOrders,
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      title: "Processing",
      value: stats.processingOrders,
      icon: RefreshCw,
      color: "bg-purple-500",
    },
    {
      title: "Completed",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "Cancelled",
      value: stats.cancelledOrders,
      icon: XCircle,
      color: "bg-red-500",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              refetch();
              refetchStats();
            }}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw size={20} />
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
          >
            {exporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-4">
              <div
                className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3`}
              >
                <Icon size={20} />
              </div>
              <p className="text-gray-500 text-xs">{card.title}</p>
              <p className="text-lg font-bold text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search orders by ID, customer name or email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(data?.data || []);
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.data?.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.some((o) => o.id === order.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders([...selectedOrders, order]);
                          } else {
                            setSelectedOrders(
                              selectedOrders.filter((o) => o.id !== order.id),
                            );
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-600">
                      #{order.id?.slice(-8)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">
                          {order.customer?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.itemsCount || 0}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(order.id, e.target.value)
                        }
                        className={`px-2 py-1 text-xs rounded-full border-0 font-medium ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.payment || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          /* View order details */
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {data.data.length} of {data.pagination.total} orders
              </p>
              <div className="flex gap-2">
                {/* Add pagination controls here */}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Orders;
