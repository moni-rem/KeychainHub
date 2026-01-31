import products from "../../data/products";
import { Link } from "react-router-dom";

export default function Products() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-6">
      {products.map((p) => (
        <div key={p.id} className="border p-4 rounded shadow hover:shadow-lg transition">
          <img
            src={p.image}
            alt={p.name}
            className="h-64 sm:h-72 md:h-80 w-full object-cover rounded"
          />
          <h2 className="flex justify-center text-xl font-bold mt-2 ">{p.name}</h2>
          {/* <p className="mt-1 font-medium">${p.price}</p> */}

          <Link
            to={`/product/${p.id}`}
            className="text-blue-500 mt-2 inline-block hover:underline flex justify-center bg-blue-100 rounded-lg h-10 items-center"
          >
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
}
