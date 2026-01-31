import { useState } from "react";
import { useUserAuth } from "../../context/UserAuthContext";

export default function ReviewPage() {
  const { user } = useUserAuth();
  const [reviews, setReviews] = useState([
    { id: 1, name: "Alice", rating: 5, comment: "Amazing products!", date: "2026-01-30" },
    { id: 2, name: "Bob", rating: 4, comment: "Great quality, fast shipping.", date: "2026-01-29" },
  ]);

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to submit a review.");
      return;
    }

    const newReview = {
      id: Date.now(),
      name: user.email.split("@")[0],
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split("T")[0],
    };

    setReviews([newReview, ...reviews]);
    setNewComment("");
    setNewRating(5);
  };

  return (
    <div className="max-w-4xl mx-auto mt-16 px-4 mb-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
        Customer Reviews
      </h1>

      {/* Review Form */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Leave a Review</h2>

          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Rating</label>
          <select
            value={newRating}
            onChange={(e) => setNewRating(Number(e.target.value))}
            className="w-full mb-4 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} Star{r > 1 ? "s" : ""}</option>
            ))}
          </select>

          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">Comment</label>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your review here..."
            className="w-full mb-4 px-3 py-2 border rounded-lg dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            rows={4}
            required
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md transition"
          >
            Submit Review
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800 dark:text-white">{review.name}</h3>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{review.date}</span>
            </div>
            <div className="mb-2">
              {"⭐".repeat(review.rating)}{" "}
              <span className="text-gray-500 dark:text-gray-400">{review.rating}/5</span>
            </div>
            <p className="text-gray-700 dark:text-gray-200">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
