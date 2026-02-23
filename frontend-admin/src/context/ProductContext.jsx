import { createContext, useContext, useState } from "react";

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([
    { id: 1, name: "Product A", price: 20, image: "/placeholder.jpg" },
    { id: 2, name: "Product B", price: 35, image: "/placeholder.jpg" },
  ]);

  const addProduct = (product) => setProducts([product, ...products]);

  return (
    <ProductsContext.Provider value={{ products, addProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
