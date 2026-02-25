import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingBag,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import { Dialog } from "@headlessui/react";
import toast from "react-hot-toast";
import userService from "../services/userService";
import orderService from "../services/orderService";
import { formatCurrency, formatDate } from "../utils/formatters";

const AUTO_REFRESH_INTERVAL = 15000;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Fetch customers
  const fetchCustomers = useCallback(async (page = 1, showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {
        page,
        limit: pagination.limit,
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await userService.getUsers(params);

      if (response.success) {
        setCustomers(response.data);
        setPagination(response.pagination);
      } else {
        toast.error(response.error || "Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error(error.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.limit, searchQuery, statusFilter]);

  useEffect(() => {
    fetchCustomers(1);
  }, [fetchCustomers]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchCustomers(pagination.page, false);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(timer);
  }, [fetchCustomers, pagination.page]);

  // Fetch customer orders
  const fetchCustomerOrders = useCallback(async (customerId) => {
    try {
      setLoadingOrders(true);
      const response = await orderService.getOrders({
        userId: customerId,
        limit: 10,
      });

      if (response.success) {
        setCustomerOrders(response.data);
      } else {
        toast.error(response.error || "Failed to fetch customer orders");
      }
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Handle search with debounce
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchCustomers(pagination.page, true);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchCustomers(newPage);
    }
  };

  // Handle view customer
  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
    await fetchCustomerOrders(customer.id);
  };

  useEffect(() => {
    if (!isViewModalOpen || !selectedCustomer?.id) return undefined;
    const timer = setInterval(() => {
      fetchCustomerOrders(selectedCustomer.id);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(timer);
  }, [isViewModalOpen, selectedCustomer, fetchCustomerOrders]);

  // Get status badge
  const getStatusBadge = (status) => {
    return status === "active" ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
        Inactive
      </span>
    );
  };

  // Get role badge
  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-purple-100 text-purple-800",
      manager: "bg-blue-100 text-blue-800",
      customer: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${styles[role] || styles.customer}`}
      >
        {role?.charAt(0).toUpperCase() + role?.slice(1) || "Customer"}
      </span>
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">
            Total: {pagination.total} customers
          </p>
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
            onClick={() => toast.success("Feature coming soon!")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <UserPlus size={20} />
            Add Customer
          </button>
        </div>
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
              placeholder="Search customers by name or email..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      {customers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No customers found
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? "Try adjusting your search"
              : "Customers will appear here once they register"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {customer.name?.charAt(0) || "U"}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-900">
                          {customer.name || "Unknown"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {customer.email}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(customer.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail size={16} className="mr-2" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone size={16} className="mr-2" />
                      <span>{customer.phone || "No phone"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      <span>{customer.location || "No location"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      <span>Joined {formatDate(customer.joinDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Total Orders</p>
                      <p className="font-semibold text-gray-900">
                        {customer.orders || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Spent</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(customer.totalSpent || 0)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewCustomer(customer)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="bg-white px-6 py-4 rounded-lg shadow flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                {pagination.page}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* View Customer Modal */}
      <Dialog
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <Dialog.Title className="text-xl font-semibold">
                Customer Details
              </Dialog.Title>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <AlertCircle size={20} />
              </button>
            </div>

            {selectedCustomer && (
              <div className="p-6 space-y-6">
                {/* Customer Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {selectedCustomer.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedCustomer.name || "Unknown"}
                    </h2>
                    <p className="text-gray-500">{selectedCustomer.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {getRoleBadge(selectedCustomer.role)}
                      {getStatusBadge(selectedCustomer.status)}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900">
                      {selectedCustomer.phone || "Not provided"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="font-medium text-gray-900">
                      {selectedCustomer.location || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedCustomer.orders || 0}
                    </p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedCustomer.totalSpent || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Spent</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">
                      {formatDate(selectedCustomer.joinDate).split(",")[0]}
                    </p>
                    <p className="text-sm text-gray-600">Customer Since</p>
                  </div>
                </div>

                {/* Recent Orders */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Recent Orders
                  </h3>
                  {loadingOrders ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : customerOrders.length > 0 ? (
                    <div className="border rounded-lg divide-y">
                      {customerOrders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="p-4 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.orderNumber ||
                                `ORD-${order.id.slice(0, 4)}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatCurrency(order.total)}
                            </p>
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded-full ${
                                order.status === "delivered"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No orders found for this customer
                    </p>
                  )}
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Customers;
