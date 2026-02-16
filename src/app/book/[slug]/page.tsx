import Image from "next/image";
import { notFound } from "next/navigation";
import BookingCalendar from "@/components/BookingCalendar";
import Reviews from "@/components/Reviews";

// Security deposit info (would come from DB in production)
const SECURITY_DEPOSITS: Record<string, { enabled: boolean; amount: number }> = {
  angelo: { enabled: false, amount: 0 },
  'gregs-charters': { enabled: true, amount: 500 },
}

// Temporary static data - will be replaced with database
const operators: Record<string, Operator> = {
  angelo: {
    slug: "angelo",
    name: "Angelo Burrows",
    businessName: "Bahamas Water Tours",
    tagline: "Glass Bottom Boat, Pig Beach & Snorkel Adventures",
    bio: "Experience the best of Nassau with Captain Angelo! Navigate above shallow reef systems on our unique glass bottom boat, hand-feed colorful fish, swim with turtles, and visit the famous swimming pigs. Local knowledge, incredible stops, and genuine care for every guest.",
    profilePhoto: "/operators/angelo/pigs-couple.jpg",
    heroPhoto: "/operators/angelo/hero.jpg",
    location: "Nassau, The Bahamas",
    departureLocation: "Near 2 Bay Street, Nassau",
    rating: 5.0,
    reviewCount: 3,
    totalBookings: 12,
    phone: "+1-242-XXX-XXXX",
    email: "bahamaswatertours@hotmail.com",
    boat: {
      name: "Glass Bottom Adventure",
      type: "32' Eduardono Glass Bottom Boat",
      capacity: 20,
      features: [
        "Glass bottom for reef viewing",
        "3/4 shaded roof for comfort",
        "Swimmer assist boarding steps",
        "Seats 18-22 passengers",
      ],
      photos: [
        "/operators/angelo/glass-bottom.jpg",
        "/operators/angelo/beach-scene.jpg",
      ],
    },
    experiencePhotos: [
      "/operators/angelo/pigs-experience.jpg",
      "/operators/angelo/pigs-couple.jpg",
    ],
    pricing: {
      halfDay: 600,
      fullDay: 1000,
      hourly: 175,
      deposit: 100,
      currency: "USD",
      note: "Price includes first 10 guests. Additional guests may incur extra charges.",
    },
    includes: [
      "Glass bottom boat experience",
      "Snorkel equipment",
      "Hand-feed colorful fish",
      "Swim with turtles",
      "Remote beach visit",
      "Tropical drinks",
    ],
    extras: [
      { name: "Swimming Pigs Visit", price: 20, per: "person", note: "Paid at beach" },
      { name: "Drone Kayak Photos", price: 100, per: "person", note: "Seasonal" },
    ],
    cancellationPolicy: "Free cancellation up to 2 days before your trip.",
    reviews: [
      {
        author: "Jill S.",
        rating: 5,
        text: "Angelo is a sincerely incredible man and made our excursion so memorable. He took us to incredible places, shared a lot of info about the country and island, and made us feel so safe. There was a group of 17 of us. We travel a lot and this was by far the best excursion we ever had.",
        date: "2026-01",
      },
      {
        author: "Jody G.",
        rating: 5,
        text: "Angelo was great!! Very welcoming and provided a great experience for our entire group!",
        date: "2026-01",
      },
      {
        author: "Mandi P.",
        rating: 5,
        text: "Great adventure for our family!",
        date: "2025-12",
      },
    ],
  },
};

interface Operator {
  slug: string;
  name: string;
  businessName: string;
  tagline: string;
  bio: string;
  profilePhoto: string;
  heroPhoto: string;
  location: string;
  departureLocation: string;
  rating: number;
  reviewCount: number;
  totalBookings: number;
  phone: string;
  email: string;
  boat: {
    name: string;
    type: string;
    capacity: number;
    features: string[];
    photos: string[];
  };
  experiencePhotos: string[];
  pricing: {
    halfDay: number;
    fullDay: number;
    hourly: number;
    deposit: number;
    currency: string;
    note?: string;
  };
  includes: string[];
  extras: { name: string; price: number; per: string; note?: string }[];
  cancellationPolicy: string;
  reviews: { author: string; rating: number; text: string; date: string }[];
}

export default async function OperatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const operator = operators[slug];

  if (!operator) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full">
        <Image
          src={operator.heroPhoto}
          alt={`${operator.businessName} - boat charter`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold">{operator.businessName}</h1>
            <p className="flex items-center gap-2 mt-1 text-white/90">
              <span>📍</span> {operator.location}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <span className="text-yellow-300">★</span>
                <span className="font-semibold">{operator.rating.toFixed(1)}</span>
                <span className="text-white/80">({operator.reviewCount} reviews)</span>
              </span>
              <span className="text-white/60">•</span>
              <span className="text-white/80">{operator.totalBookings} trips completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Banner for unclaimed pages */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-teal-900">
              Are you the owner of {operator.businessName}?
            </p>
            <p className="text-xs text-teal-700 mt-1">
              Claim this page to manage bookings, update pricing, and accept payments directly.
            </p>
          </div>
          <a
            href={`mailto:support@charterdirect.com?subject=Claim ${operator.businessName}&body=I'd like to claim the page for ${operator.businessName} (${operator.slug}).`}
            className="shrink-0 ml-4 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Claim This Page
          </a>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                {operator.tagline}
              </h2>
              <p className="text-gray-600 leading-relaxed">{operator.bio}</p>
            </section>

            {/* Boat Info */}
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="relative h-48 md:h-64">
                <Image
                  src={operator.boat.photos[0]}
                  alt={operator.boat.type}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">The Experience</h3>
                <p className="font-medium text-gray-900 mb-3">{operator.boat.type}</p>
                <ul className="text-gray-600 space-y-2">
                  {operator.boat.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-sky-500">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Photo Gallery */}
            <section>
              <h3 className="font-semibold text-gray-900 mb-4">What You&apos;ll Experience</h3>
              <div className="grid grid-cols-2 gap-3">
                {[...operator.experiencePhotos, operator.boat.photos[1]].filter(Boolean).map((photo, i) => (
                  <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    <Image
                      src={photo}
                      alt={`Experience photo ${i + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* What's Included */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What&apos;s Included</h3>
              <ul className="grid grid-cols-2 gap-2">
                {operator.includes.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <span className="text-green-500">✓</span> {item}
                  </li>
                ))}
              </ul>

              {operator.extras.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Optional Add-ons
                  </h4>
                  <ul className="space-y-1">
                    {operator.extras.map((extra, i) => (
                      <li key={i} className="flex items-center justify-between text-gray-600">
                        <span>{extra.name}</span>
                        <span className="text-gray-900 font-medium">
                          +${extra.price}/{extra.per}
                          {extra.note && (
                            <span className="text-gray-400 text-sm ml-1">
                              ({extra.note})
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Reviews */}
            <section>
              <h3 className="font-semibold text-gray-900 mb-4">
                Guest Reviews ({operator.reviewCount})
              </h3>
              <Reviews reviews={operator.reviews} />
            </section>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Book Your Trip</h3>

                {/* Pricing */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Half Day (4 hrs)</span>
                    <span className="font-semibold">${operator.pricing.halfDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Day (8 hrs)</span>
                    <span className="font-semibold">${operator.pricing.fullDay}</span>
                  </div>
                  {operator.pricing.note && (
                    <p className="text-xs text-gray-400 mt-2">{operator.pricing.note}</p>
                  )}
                </div>

                {/* Calendar */}
                <BookingCalendar operatorSlug={operator.slug} />

                {/* Deposit Info */}
                <div className="mt-4 p-4 bg-sky-50 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-sky-900">
                    ${operator.pricing.deposit} deposit to reserve
                  </p>
                  <div className="text-sm text-sky-800 space-y-1">
                    <p className="flex justify-between">
                      <span>💵 Pay remainder in cash:</span>
                      <span className="font-medium">No extra fee</span>
                    </p>
                    <p className="flex justify-between">
                      <span>💳 Pay remainder by card:</span>
                      <span className="font-medium">+5% service fee</span>
                    </p>
                  </div>
                  <p className="text-xs text-sky-600 pt-1 border-t border-sky-200">
                    Card payments include processing fees + cancellation protection
                  </p>
                </div>

                {/* Security Deposit */}
                {SECURITY_DEPOSITS[operator.slug]?.enabled && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-semibold text-amber-900">
                      🛡️ Refundable Security Deposit: ${SECURITY_DEPOSITS[operator.slug].amount}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      A refundable security deposit of ${SECURITY_DEPOSITS[operator.slug].amount} will be authorized (not charged) on your card. Only captured if a damage claim is filed within 48 hours of the trip.
                    </p>
                  </div>
                )}

                {/* Cancellation */}
                <p className="text-xs text-gray-400 mt-4">
                  {operator.cancellationPolicy}
                </p>
              </div>

              {/* Contact */}
              <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Questions?</h4>
                <a
                  href={`mailto:${operator.email}`}
                  className="text-sky-600 hover:underline text-sm"
                >
                  {operator.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-gray-400 text-sm">
        <p>Book direct. Save on fees. Support local captains.</p>
        <p className="mt-1">Powered by Charter Direct</p>
      </footer>
    </div>
  );
}
