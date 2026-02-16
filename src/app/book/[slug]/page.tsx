import Image from "next/image";
import { notFound } from "next/navigation";
import BookingCalendar from "@/components/BookingCalendar";
import Reviews from "@/components/Reviews";
import { createAdminClient } from "@/lib/supabase/server";

async function getOperator(slug: string) {
  const supabase = createAdminClient();

  const { data: operator } = await supabase
    .from("operators")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!operator) return null;

  const [{ data: boats }, { data: pricing }, { data: reviews }, { data: inclusions }] =
    await Promise.all([
      supabase
        .from("boats")
        .select("*")
        .eq("operator_id", operator.id)
        .eq("is_primary", true)
        .limit(1),
      supabase
        .from("pricing")
        .select("*")
        .eq("operator_id", operator.id)
        .eq("active", true)
        .order("base_price", { ascending: true }),
      supabase
        .from("reviews")
        .select("*")
        .eq("operator_id", operator.id)
        .eq("visible", true)
        .order("review_date", { ascending: false }),
      supabase
        .from("inclusions")
        .select("*")
        .eq("operator_id", operator.id),
    ]);

  const boat = boats?.[0] || null;
  const reviewCount = reviews?.length || 0;
  const avgRating =
    reviewCount > 0
      ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  return { operator, boat, pricing: pricing || [], reviews: reviews || [], inclusions: inclusions || [], reviewCount, avgRating };
}

export default async function OperatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getOperator(slug);

  if (!data) {
    notFound();
  }

  const { operator, boat, pricing, reviews, inclusions, reviewCount, avgRating } = data;

  const halfDay = pricing.find((p) => p.trip_type === "half_day_am");
  const fullDay = pricing.find((p) => p.trip_type === "full_day");
  const deposit = halfDay?.deposit_amount || 100;

  // Photos can be strings or {url, caption} objects
  const rawPhotos: (string | { url: string; caption?: string })[] = boat?.photos || [];
  const boatPhotos: string[] = rawPhotos.map((p) => (typeof p === "string" ? p : p.url));
  const boatFeatures: string[] = boat?.features || [];
  const heroImage = operator.hero_image || boatPhotos[0] || "/placeholder.jpg";

  const formattedReviews = reviews.map((r) => ({
    author: r.reviewer_name,
    rating: r.rating,
    text: r.review_text || "",
    date: r.review_date || r.created_at?.slice(0, 7) || "",
  }));

  const includedItems = inclusions.filter((i) => i.included);
  const extraItems = inclusions.filter((i) => !i.included);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80 lg:h-96 w-full bg-gray-200">
        <Image
          src={heroImage}
          alt={`${operator.business_name} - boat charter`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold">{operator.business_name}</h1>
            <p className="flex items-center gap-2 mt-1 text-white/90">
              <span>📍</span> {operator.location}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <span className="text-yellow-300">★</span>
                <span className="font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-white/80">({reviewCount} reviews)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Banner for unclaimed pages */}
      {!operator.claimed && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-900">
                Are you the owner of {operator.business_name}?
              </p>
              <p className="text-xs text-teal-700 mt-1">
                Claim this page to manage bookings, update pricing, and accept payments directly.
              </p>
            </div>
            <a
              href={`mailto:support@castoff.boats?subject=Claim ${operator.business_name}&body=I'd like to claim the page for ${operator.business_name} (${operator.slug}).`}
              className="shrink-0 ml-4 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Claim This Page
            </a>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                About
              </h2>
              <p className="text-gray-600 leading-relaxed">{operator.description}</p>
            </section>

            {/* Boat Info */}
            {boat && (
              <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {boatPhotos[0] && (
                  <div className="relative h-48 md:h-64">
                    <Image
                      src={boatPhotos[0]}
                      alt={boat.type || boat.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{boat.name}</h3>
                  <p className="text-gray-500 mb-3">{boat.type} · Up to {boat.capacity} guests</p>
                  {boatFeatures.length > 0 && (
                    <ul className="text-gray-600 space-y-2">
                      {boatFeatures.map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="text-sky-500">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            )}

            {/* What's Included */}
            {includedItems.length > 0 && (
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">What&apos;s Included</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {includedItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-500">✓</span> {item.name}
                    </li>
                  ))}
                </ul>
                {extraItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Optional Add-ons</h4>
                    <ul className="space-y-1">
                      {extraItems.map((item) => (
                        <li key={item.id} className="text-gray-600">
                          {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Reviews */}
            <section>
              <h3 className="font-semibold text-gray-900 mb-4">
                Guest Reviews ({reviewCount})
              </h3>
              <Reviews reviews={formattedReviews} />
            </section>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Book Your Trip</h3>

                {/* Pricing */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  {pricing.map((p) => (
                    <div key={p.id} className="flex justify-between">
                      <span className="text-gray-600">{p.display_name}</span>
                      <span className="font-semibold">${Number(p.base_price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar */}
                <BookingCalendar operatorSlug={operator.slug} />

                {/* Deposit Info */}
                <div className="mt-4 p-4 bg-sky-50 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-sky-900">
                    ${deposit} deposit to reserve
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
                {operator.security_deposit_enabled && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-semibold text-amber-900">
                      🛡️ Refundable Security Deposit: ${Number(operator.security_deposit_amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      A hold will be authorized (not charged) on your card. Only captured if a damage claim is filed within 48 hours of the trip.
                    </p>
                  </div>
                )}

                {/* Cancellation */}
                <p className="text-xs text-gray-400 mt-4">
                  Free cancellation up to 2 days before your trip.
                </p>
              </div>

              {/* Contact */}
              {operator.email && (
                <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Questions?</h4>
                  <a
                    href={`mailto:${operator.email}`}
                    className="text-sky-600 hover:underline text-sm"
                  >
                    {operator.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-gray-400 text-sm">
        <p>Book direct. Save on fees. Support local captains.</p>
        <p className="mt-1">Powered by <a href="/" className="text-sky-500 hover:underline">Cast Off</a></p>
      </footer>
    </div>
  );
}
