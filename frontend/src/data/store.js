import mockProducts from "./mockProducts";
import mockOrders from "./mockOrders";

const PRODUCTS_KEY = "admin_products_v1";
const ORDERS_KEY = "admin_orders_v1";

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function getProducts() {
  return safeParse(localStorage.getItem(PRODUCTS_KEY), mockProducts);
}

export function setProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getOrders() {
  return safeParse(localStorage.getItem(ORDERS_KEY), mockOrders);
}

export function setOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export { PRODUCTS_KEY, ORDERS_KEY };
