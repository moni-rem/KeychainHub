import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct
} from "../controller/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById); // 👈 THIS IS IMPORTANT
router.post("/", createProduct);
router.delete("/:id", deleteProduct);

export default router;
