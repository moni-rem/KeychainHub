import { db } from "../config/db.js";

// GET all products
export const getProducts = (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// GET product by ID
export const getProductById = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM products WHERE id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(results[0]); 
  });
};

export const deleteProduct = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM products WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  });
};



// CREATE product (admin)
export const createProduct = (req, res) => {
  const { name, description, price, stock, image } = req.body;
  const sql = "INSERT INTO products (name, description, price, stock, image) VALUES (?,?,?,?,?)";

  db.query(sql, [name, description, price, stock, image], (err, result) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ message: "Product created", productId: result.insertId });
  });
};
