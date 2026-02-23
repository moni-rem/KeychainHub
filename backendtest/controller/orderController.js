import { db } from "../config/db.js";

export const createOrder = (req, res) => {
  const { userId = null, items = [] } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // total from items
  const total = items.reduce((sum, it) => {
    const price = Number(it.price || 0);
    const qty = Number(it.quantity || 0);
    return sum + price * qty;
  }, 0);

  // 1) create order
  const orderSql = "INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)";
  db.query(orderSql, [userId, total, "pending"], (err, orderResult) => {
    if (err) return res.status(500).json(err);

    const orderId = orderResult.insertId;

    // 2) insert order items
    const values = items.map((it) => [
      orderId,
      it.product_id || it.id, // allow either field name
      Number(it.quantity || 1),
      Number(it.price || 0),
    ]);

    const itemsSql =
      "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?";

    db.query(itemsSql, [values], (err2) => {
      if (err2) return res.status(500).json(err2);

      return res.status(201).json({
        message: "Order placed successfully",
        orderId,
        total,
      });
    });
  });
};
