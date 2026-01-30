import { useParams } from "react-router-dom";

export default function OrderPage() {
  const { id } = useParams();

  return (
    <div className="max-w-3xl mx-auto mt-24 text-center">
      <h1 className="text-3xl font-bold mb-6">
        Order Confirmed 
      </h1>

      <p className="text-lg">
        Your order ID is:
      </p>

      <p className="text-2xl font-mono mt-2">
        #{id}
      </p>

      <p className="mt-6 text-gray-600">
        Thank you for your purchase!
      </p>
    </div>
  );
}
