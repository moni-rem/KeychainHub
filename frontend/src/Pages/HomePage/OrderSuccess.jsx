import { useParams, Link } from "react-router-dom";

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="max-w-xl mx-auto mt-24 p-6 text-center">
      <h1 className="text-3xl font-bold"> Order Placed!</h1>
      <p className="mt-3 text-gray-600">Your order ID is <b>#{id}</b></p>

      <div className="mt-6 flex justify-center gap-3">
        <Link to="/shop" className="bg-blue-600 text-white px-4 py-2 rounded">Continue Shopping</Link>
        <Link to="/" className="bg-gray-200 px-4 py-2 rounded">Home</Link>
      </div>
    </div>
  );
}
