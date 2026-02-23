import { useProducts } from "..//../context/ProductContext";

export default function ProductList() {
  const { products } = useProducts();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {products.map(p => (
          <div key={p.id} className="border rounded p-4 shadow">
            <img src={p.image} alt={p.name} className="h-40 w-full object-cover rounded mb-2"/>
            <h2 className="font-bold">{p.name}</h2>
            <p>${p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
