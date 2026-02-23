// components/FeedbackSection.jsx
import { useState } from "react";
import { useUserAuth } from "..//../context/UserAuthContext";

export default function FeedbackSection() {
  const { user } = useUserAuth();

  // Mock reviews; in real app, this could come from API or localStorage
  const [reviews, setReviews] = useState([
    { id: 1, name: "Alice", rating: 5, comment: "Amazing keychains, very high quality!", date: "2026-01-30" },
    { id: 2, name: "Bob", rating: 4, comment: "Fast shipping and good packaging.", date: "2026-01-29" },
    { id: 3, name: "Charlie", rating: 5, comment: "Great customer service, highly recommend!", date: "2026-01-28" },
  ]);

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to leave feedback.");
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
    <section className="max-w-5xl mx-auto mt-24 px-4 mb-4">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
        Customer Feedback
      </h2>

      {/* Reviews List */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {reviews.slice(0, 3).map((review) => (
          <div
            key={review.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800 dark:text-white">{review.name}</h3>
              <span className="text-gray-500 dark:text-gray-400 text-sm">{review.date}</span>
            </div>
            <div className="mb-2">
              {"⭐".repeat(review.rating)} <span className="text-gray-500 dark:text-gray-400">{review.rating}/5</span>
            </div>
            <p className="text-gray-700 dark:text-gray-200">{review.comment}</p>
          </div>
        ))}
      </div>

     
        
      
    </section>
  );
}
