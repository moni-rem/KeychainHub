import { db } from "../config/db.js";

// existing getAdminStats should still return totals

export const getAdminAnalytics = (req, res) => {
  // last 7 days (adjust if you want)
  const salesTimelineSql = `
    SELECT DATE(created_at) AS day,
           COUNT(*) AS orders,
           COALESCE(SUM(total),0) AS revenue
    FROM orders
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
    GROUP BY DATE(created_at)
    ORDER BY day ASC
  `;

  const recentOrdersSql = `
    SELECT id, total, status, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 8
  `;

  const topProductsSql = `
    SELECT p.id, p.name, SUM(oi.quantity) AS unitsSold
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    GROUP BY p.id, p.name
    ORDER BY unitsSold DESC
    LIMIT 5
  `;

  db.query(salesTimelineSql, (err1, salesTimeline) => {
    if (err1) return res.status(500).json(err1);

    db.query(recentOrdersSql, (err2, recentOrders) => {
      if (err2) return res.status(500).json(err2);

      db.query(topProductsSql, (err3, topProducts) => {
        // If you don’t have order_items yet, don’t crash dashboard
        if (err3 && err3.code === "ER_NO_SUCH_TABLE") {
          return res.json({ salesTimeline, recentOrders, topProducts: [] });
        }
        if (err3) return res.status(500).json(err3);

        res.json({ salesTimeline, recentOrders, topProducts });
      });
    });
  });
};
