import { db } from "../config/db.js";
import bcrypt from "bcryptjs";

export const registerUser = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length > 0) return res.status(409).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed],
      (err2, result) => {
        if (err2) return res.status(500).json(err2);

        res.status(201).json({
          message: "User registered",
          user: { id: result.insertId, name, email }
        });
      }
    );
  });
};


export const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {
    if (err) return res.status(500).json(err);
    if (rows.length === 0) return res.status(401).json({ message: "Invalid email or password" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    // simple login response (later you can add JWT)
    res.json({ message: "Login success", user: { id: user.id, email: user.email } });
  });
};
