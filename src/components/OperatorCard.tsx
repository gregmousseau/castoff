import Image from 'next/image'
import Link from 'next/link'

interface OperatorCardProps {
  slug: string
  businessName: string
  location: string | null
  heroImage: string | null
  averageRating: number
  reviewCount: number
  startingPrice: number | null
  verified?: boolean
}

export default function OperatorCard({
  slug,
  businessName,
  location,
  heroImage,
  averageRating,
  reviewCount,
  startingPrice,
  verified,
}: OperatorCardProps) {
  return (
    <Link
      href={`/book/${slug}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-100">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={businessName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-4xl">⛵</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors flex items-center gap-1.5">
          {businessName}
          {verified && <span className="text-green-600 text-xs" title="Verified Captain">✓</span>}
        </h3>
        {location && (
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <span>📍</span> {location}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            {averageRating > 0 ? (
              <>
                <span className="text-yellow-400">★</span>
                <span className="text-sm font-medium text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">({reviewCount})</span>
              </>
            ) : (
              <span className="text-sm text-gray-400">New</span>
            )}
          </div>
          {startingPrice !== null && (
            <span className="text-sm text-gray-600">
              from <span className="font-semibold text-gray-900">${startingPrice}</span>
            </span>
          )}
        </div>

        <button className="mt-3 w-full bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
          Book Now
        </button>
      </div>
    </Link>
  )
}
