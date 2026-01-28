const mockOrders = [
  {
    id: "o1001",
    customer: "Sok Dara",
    total: 12.75,
    payment: "COD",
    status: "pending",
    date: "2026-01-27",
    items: [
      { name: "Acrylic Keychain - Anime", qty: 2, price: 3.5 },
      { name: "Metal Keychain - Car Logo", qty: 1, price: 5.0 },
    ],
  },
  {
    id: "o1002",
    customer: "Chanthy",
    total: 4.25,
    payment: "ABA",
    status: "shipped",
    date: "2026-01-26",
    items: [{ name: "Custom Name Keychain", qty: 1, price: 4.25 }],
  },
];

export default mockOrders;
