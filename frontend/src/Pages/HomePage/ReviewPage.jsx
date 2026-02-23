import { useState } from "react";
import { useUserAuth } from "../../context/UserAuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function ReviewPage() {
  const { user } = useUserAuth();
  const { theme } = useTheme(); // for dark/light styling

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
    <div className={`max-w-4xl mx-auto mt-16 px-4 mb-6 min-h-screen ${theme === "light" ? "bg-white text-black" : "bg-black text-white"}`}>
      <h1 className="text-3xl font-bold mb-8 text-center">
        Customer Reviews
      </h1>

      {/* Review Form */}
      <form
        onSubmit={handleSubmit}
        className={`mb-8 p-6 rounded-lg shadow-md ${theme === "light" ? "bg-white" : "bg-gray-800"}`}
      >
        <h2 className="text-xl font-semibold mb-4">
          Leave a Review
        </h2>

        {!user && (
          <p className="mb-4 text-red-500">
            You must be logged in to submit a review.
          </p>
        )}

        <label className="block mb-2 font-medium">Rating</label>
        <select
          value={newRating}
          onChange={(e) => setNewRating(Number(e.target.value))}
          className={`w-full mb-4 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}
          disabled={!user}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} Star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium">Comment</label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write your review here..."
          className={`w-full mb-4 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"}`}
          rows={4}
          required
          disabled={!user}
        />

        <button
          type="submit"
          className={`px-6 py-2 rounded-lg shadow-md transition ${user ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
          disabled={!user}
        >
          Submit Review
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={`p-4 rounded-lg shadow-md ${theme === "light" ? "bg-white" : "bg-gray-800"}`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{review.name}</h3>
              <span className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>{review.date}</span>
            </div>
            <div className="mb-2">
              {"⭐".repeat(review.rating)}{" "}
              <span className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                {review.rating}/5
              </span>
            </div>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
