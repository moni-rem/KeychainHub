// services/dataService.js
export const dataService = {
  // Dashboard data
  getDashboardData() {
    return {
      metrics: {
        totalRevenue: 84250,
        totalOrders: 1248,
        totalCustomers: 12540,
        activeUsers: 12540,
        conversionRate: 3.42,
        avgOrderValue: 124.5,
        growthRate: 24,
        engagement: 89,
        todayRevenue: 4892,
        activeSessions: 1248,
      },
      recentOrders: [
        {
          id: "ORD-7829",
          customer: "Alex Morgan",
          date: "2024-01-24",
          total: 452.0,
          status: "completed",
          items: 3,
          email: "alex@example.com",
          shipping: "Express",
          payment: "Credit Card",
        },
        {
          id: "ORD-7828",
          customer: "Sarah Wilson",
          date: "2024-01-24",
          total: 129.0,
          status: "processing",
          items: 1,
          email: "sarah@example.com",
          shipping: "Standard",
          payment: "PayPal",
        },
        {
          id: "ORD-7827",
          customer: "James Cooper",
          date: "2024-01-23",
          total: 1299.0,
          status: "completed",
          items: 5,
          email: "james@example.com",
          shipping: "Express",
          payment: "Credit Card",
        },
        {
          id: "ORD-7826",
          customer: "Emily Chen",
          date: "2024-01-23",
          total: 89.0,
          status: "cancelled",
          items: 1,
          email: "emily@example.com",
          shipping: "Standard",
          payment: "Credit Card",
        },
        {
          id: "ORD-7825",
          customer: "Michael Ross",
          date: "2024-01-22",
          total: 245.0,
          status: "completed",
          items: 2,
          email: "michael@example.com",
          shipping: "Express",
          payment: "Apple Pay",
        },
      ],
      topProducts: [
        { name: "Premium Headphones", sales: 245, revenue: 73500 },
        { name: "Ergonomic Chair", sales: 189, revenue: 37710 },
        { name: "Wireless Keyboard", sales: 156, revenue: 15444 },
      ],
      systemStatus: {
        database: { status: "Healthy", responseTime: 45, cpu: 25, ram: 42 },
        server: { status: "Stable", cpu: 65, ram: 42 },
        cloud: { status: "Online", uptime: 99.9 },
      },
    };
  },

  // Orders data
  getOrdersData() {
    return [
      {
        id: "ORD-7829",
        customer: "Alex Morgan",
        date: "2024-01-24",
        total: 452.0,
        status: "completed",
        items: 3,
        email: "alex@example.com",
        shipping: "Express",
        payment: "Credit Card",
      },
      {
        id: "ORD-7828",
        customer: "Sarah Wilson",
        date: "2024-01-24",
        total: 129.0,
        status: "processing",
        items: 1,
        email: "sarah@example.com",
        shipping: "Standard",
        payment: "PayPal",
      },
      {
        id: "ORD-7827",
        customer: "James Cooper",
        date: "2024-01-23",
        total: 1299.0,
        status: "completed",
        items: 5,
        email: "james@example.com",
        shipping: "Express",
        payment: "Credit Card",
      },
      {
        id: "ORD-7826",
        customer: "Emily Chen",
        date: "2024-01-23",
        total: 89.0,
        status: "cancelled",
        items: 1,
        email: "emily@example.com",
        shipping: "Standard",
        payment: "Credit Card",
      },
      {
        id: "ORD-7825",
        customer: "Michael Ross",
        date: "2024-01-22",
        total: 245.0,
        status: "completed",
        items: 2,
        email: "michael@example.com",
        shipping: "Express",
        payment: "Apple Pay",
      },
    ];
  },

  // Analytics data
  getAnalyticsData() {
    return {
      revenueData: [
        { month: "Jan", revenue: 40000, profit: 12000 },
        { month: "Feb", revenue: 30000, profit: 9000 },
        { month: "Mar", revenue: 50000, profit: 15000 },
        { month: "Apr", revenue: 27800, profit: 8340 },
        { month: "May", revenue: 48900, profit: 14670 },
        { month: "Jun", revenue: 63900, profit: 19170 },
        { month: "Jul", revenue: 74900, profit: 22470 },
      ],
      trafficSources: [
        { source: "Direct", percentage: 45, color: "bg-blue-500" },
        { source: "Social", percentage: 32, color: "bg-cyan-400" },
        { source: "Organic", percentage: 23, color: "bg-purple-500" },
      ],
      metrics: {
        pageViews: 245000,
        bounceRate: 42,
        avgSession: "4m 32s",
        conversion: 3.2,
      },
    };
  },

  // Customers data
  getCustomersData() {
    return [
      {
        id: 1,
        name: "John Smith",
        email: "john@example.com",
        phone: "+1 (555) 123-4567",
        joinDate: "2023-01-15",
        orders: 12,
        totalSpent: 2450.0,
        status: "active",
        location: "New York, USA",
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "+1 (555) 234-5678",
        joinDate: "2023-02-20",
        orders: 8,
        totalSpent: 1299.0,
        status: "active",
        location: "Los Angeles, USA",
      },
      {
        id: 3,
        name: "Mike Chen",
        email: "mike@example.com",
        phone: "+1 (555) 345-6789",
        joinDate: "2023-03-10",
        orders: 5,
        totalSpent: 890.0,
        status: "inactive",
        location: "Chicago, USA",
      },
      {
        id: 4,
        name: "Emma Wilson",
        email: "emma@example.com",
        phone: "+1 (555) 456-7890",
        joinDate: "2023-04-05",
        orders: 15,
        totalSpent: 3250.0,
        status: "active",
        location: "Miami, USA",
      },
      {
        id: 5,
        name: "David Lee",
        email: "david@example.com",
        phone: "+1 (555) 567-8901",
        joinDate: "2023-05-12",
        orders: 3,
        totalSpent: 450.0,
        status: "active",
        location: "Seattle, USA",
      },
    ];
  },

  // Reports data
  getReportsData() {
    return {
      salesReport: {
        totalSales: 125000,
        totalOrders: 1248,
        avgOrderValue: 124.5,
        growth: 12.5,
      },
      performanceReport: {
        topProducts: [
          { name: "Premium Headphones", sales: 245, revenue: 73500 },
          { name: "Ergonomic Chair", sales: 189, revenue: 37710 },
          { name: "Wireless Keyboard", sales: 156, revenue: 15444 },
          { name: "Smart Watch", sales: 98, revenue: 39102 },
          { name: "Desk Lamp", sales: 76, revenue: 3724 },
        ],
        topCategories: [
          { category: "Electronics", revenue: 125000, growth: 15.2 },
          { category: "Furniture", revenue: 78900, growth: 8.5 },
          { category: "Accessories", revenue: 45600, growth: 12.3 },
        ],
      },
    };
  },
};
