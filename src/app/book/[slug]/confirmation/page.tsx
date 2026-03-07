import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string; paypal_order_id?: string; token?: string }>;
}) {
  const { slug } = await params;
  const { session_id, paypal_order_id, token } = await searchParams;

  // PayPal returns with "token" query param (the order ID)
  const paypalOrderId = paypal_order_id || token;

  if (!session_id && !paypalOrderId) {
    redirect(`/book/${slug}`);
  }

  const supabase = createAdminClient();

  // Get operator info
  const { data: operator } = await supabase
    .from("operators")
    .select("business_name, phone, email")
    .eq("slug", slug)
    .single();

  if (!operator) {
    redirect("/");
  }

  // If PayPal, capture the order server-side
  let paypalCaptured = false;
  if (paypalOrderId) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const captureRes = await fetch(`${baseUrl}/api/paypal/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: paypalOrderId }),
      });
      const captureData = await captureRes.json();
      paypalCaptured = captureData.success;
    } catch (e) {
      console.error("PayPal capture on confirmation:", e);
    }
  }

  // Get the most recent booking for this operator (created within last 30 min)
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("operator_id", (await supabase.from("operators").select("id").eq("slug", slug).single()).data?.id || "")
    .gte("created_at", thirtyMinAgo)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-");
      const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const tripDate = booking?.trip_date || "";
  const finalPrice = Number(booking?.final_price || 0);
  const depositAmount = Number(booking?.deposit_amount || 0);
  const remainingAmount = finalPrice - depositAmount;
  const provider = paypalOrderId ? "paypal" : "stripe";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-4xl mb-4">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Request Sent!</h1>
          <p className="text-gray-600 mt-2">
            {provider === "paypal"
              ? paypalCaptured
                ? `Your payment has been processed. ${operator.business_name} will confirm your booking shortly.`
                : `Your booking request has been submitted. ${operator.business_name} will confirm shortly.`
              : `Your deposit has been authorized. ${operator.business_name} will confirm your booking shortly.`}
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-sky-600 text-white p-4">
            <h2 className="font-semibold">{operator.business_name}</h2>
            <p className="text-sky-100 text-sm">Booking Request</p>
          </div>

          <div className="p-6 space-y-4">
            {tripDate && (
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold text-gray-900">{formatDate(tripDate)}</p>
              </div>
            )}

            {booking?.trip_type && (
              <div>
                <p className="text-sm text-gray-500">Trip</p>
                <p className="font-semibold text-gray-900">{booking.trip_type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
              </div>
            )}

            {booking?.party_size && (
              <div>
                <p className="text-sm text-gray-500">Party Size</p>
                <p className="font-semibold text-gray-900">{booking.party_size} guest{booking.party_size > 1 ? "s" : ""}</p>
              </div>
            )}

            <hr className="border-gray-100" />

            {/* Payment Info */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{provider === "paypal" ? "Deposit (paid)" : "Deposit (authorized)"}</span>
                <span className="font-semibold text-gray-900">${depositAmount.toLocaleString()}</span>
              </div>
              {remainingAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Remainder (due day of trip)</span>
                  <span className="font-semibold text-gray-900">${remainingAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-gray-900">${finalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment method badge */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Paid via</span>
              <span className={`px-2 py-0.5 rounded font-medium ${provider === "paypal" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>
                {provider === "paypal" ? "PayPal" : "Stripe"}
              </span>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-amber-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">1.</span>
              <span>{operator.business_name} will review your request (usually within a few hours)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">2.</span>
              <span>If confirmed, you&apos;ll receive a confirmation email with trip details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">3.</span>
              <span>If they can&apos;t accommodate, your {provider === "paypal" ? "payment" : "hold"} will be {provider === "paypal" ? "refunded" : "released"} (no charge)</span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Questions? Contact the operator:</p>
          {operator.email && <p className="font-medium text-gray-900">{operator.email}</p>}
          {operator.phone && <p className="font-medium text-gray-900">{operator.phone}</p>}
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href={`/book/${slug}`}
            className="text-sky-600 hover:underline text-sm"
          >
            ← Back to {operator.business_name}
          </Link>
        </div>
      </div>
    </div>
  );
}
