import express from "express";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { db } from "./config/db.js";

const app = express();

// ✅ MIDDLEWARE FIRST
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));
app.use(express.json());

// ✅ ROUTES AFTER MIDDLEWARE

// stats
app.get("/api/admin/stats", (req, res) => {
  db.query("SELECT COUNT(*) AS totalProducts FROM products", (err, prodResult) => {
    if (err) return res.status(500).json(err);

    db.query("SELECT COUNT(*) AS totalUsers FROM users", (err2, userResult) => {
      if (err2) return res.status(500).json(err2);

      // if orders table not yet created, return 0 instead of crashing
      db.query("SELECT COUNT(*) AS totalOrders FROM orders", (err3, orderResult) => {
        if (err3) {
          if (err3.code === "ER_NO_SUCH_TABLE") {
            return res.json({
              totalProducts: prodResult[0].totalProducts,
              totalUsers: userResult[0].totalUsers,
              totalOrders: 0,
            });
          }
          return res.status(500).json(err3);
        }

        res.json({
          totalProducts: prodResult[0].totalProducts,
          totalUsers: userResult[0].totalUsers,
          totalOrders: orderResult[0].totalOrders,
        });
      });
    });
  });
});

// ✅ analytics (THIS FIXES YOUR 404)
app.get("/api/admin/analytics", (req, res) => {
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

  db.query(salesTimelineSql, (err1, salesTimeline) => {
    if (err1) {
      if (err1.code === "ER_NO_SUCH_TABLE") {
        return res.json({ salesTimeline: [], recentOrders: [], topProducts: [] });
      }
      return res.status(500).json(err1);
    }

    db.query(recentOrdersSql, (err2, recentOrders) => {
      if (err2) return res.status(500).json(err2);

      res.json({
        salesTimeline,
        recentOrders,
        topProducts: [] // later when you add order_items
      });
    });
  });
});

// products
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);




const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
