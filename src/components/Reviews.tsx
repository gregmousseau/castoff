interface Review {
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface ReviewsProps {
  reviews: Review[];
}

function formatDate(dateStr: string) {
  const [year, month] = dateStr.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return `${months[parseInt(month) - 1]} ${year}`;
}

export default function Reviews({ reviews }: ReviewsProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic">No reviews yet.</p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* Avatar placeholder */}
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                {review.author.charAt(0)}
              </div>
              <span className="font-medium text-gray-900">{review.author}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-yellow-400">★</span>
              <span className="text-gray-600">{review.rating.toFixed(1)}</span>
              <span className="text-gray-300 mx-1">•</span>
              <span className="text-gray-400">{formatDate(review.date)}</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
        </div>
      ))}
    </div>
  );
}
