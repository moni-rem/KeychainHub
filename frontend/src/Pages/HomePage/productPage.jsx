// import { useParams } from "react-router-dom";
// import { products } from "./data/products";

// export default function ProductPage() {
//   const { id } = useParams(); // 👈 gets ID from URL
//   const product = products.find((p) => p.id === id);

//   if (!product) return <p>Product not found</p>;

//   return (
//     <div className="max-w-5xl mx-auto p-8 grid md:grid-cols-2 gap-8">
//       <img
//         src={product.image}
//         className="w-full rounded-xl shadow"
//       />

//       <div>
//         <h1 className="text-3xl font-bold">{product.name}</h1>
//         <p className="text-xl text-gray-600 my-2">{product.price}</p>
//         <p className="text-gray-700 mb-6">{product.description}</p>

//         <button className="bg-gray-900 text-white px-6 py-3 rounded-xl">
//           Add to Cart
//         </button>
//       </div>
//     </div>
//   );
// }
