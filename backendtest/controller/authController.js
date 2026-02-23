import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: "User not found" });

    const user = results[0];

    // Check password
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Invalid password" });

    // Create JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
};
