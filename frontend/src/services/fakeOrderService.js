const ORDERS_KEY = "fake_orders_db";

function getOrders() {
  return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function createOrder(user, items) {
  const orders = getOrders();

  const newOrder = {
    id: Date.now(),
    userEmail: user.email,
    items,
    date: new Date().toISOString()
  };

  orders.push(newOrder);
  saveOrders(orders);
  return newOrder;
}

export function getUserOrders(email) {
  return getOrders().filter(o => o.userEmail === email);
}
