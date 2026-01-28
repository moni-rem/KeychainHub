import products from "..//../data/products";
import { Link } from "react-router-dom";

export default function Products() {
  return (
    <div className="grid grid-cols-4 gap-6 p-6">
      {products.map((p) => (
        <div key={p.id} className="border p-4 rounded shadow">
          <img src={p.image} alt={p.name} className="h-80 w-full oject-cover"/>
          <h2 className="text-xl font-bold">{p.name}</h2>
          <p>${p.price}</p>

          <Link to={`/product/${p.id}`} className="text-blue-500">
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
}
