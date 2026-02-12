import Link from "next/link";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";

// Operator data (will move to database)
const operators: Record<string, { name: string; phone: string }> = {
  angelo: {
    name: "Bahamas Water Tours",
    phone: "+1-242-XXX-XXXX",
  },
};

const SLOT_INFO: Record<string, { label: string; time: string }> = {
  "half-am": { label: "Half Day AM", time: "8:00 AM - 12:00 PM" },
  "half-pm": { label: "Half Day PM", time: "1:00 PM - 5:00 PM" },
  full: { label: "Full Day", time: "8:00 AM - 5:00 PM" },
};

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { slug } = await params;
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect(`/book/${slug}`);
  }

  const operator = operators[slug];
  if (!operator) {
    redirect("/");
  }

  // Fetch the checkout session to get booking details
  let session;
  let paymentIntent;
  try {
    const stripe = getStripe();
    session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_intent) {
      paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string
      );
    }
  } catch {
    redirect(`/book/${slug}`);
  }

  const metadata = paymentIntent?.metadata || session?.metadata || {};
  const { date, slot, totalPrice, depositAmount } = metadata;
  const slotInfo = SLOT_INFO[slot] || { label: "Charter", time: "" };

  // Format date nicely
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

  const remainingAmount = parseInt(totalPrice || "0") - parseInt(depositAmount || "0");

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
            Your deposit has been authorized. {operator.name} will confirm your booking shortly.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-sky-600 text-white p-4">
            <h2 className="font-semibold">{operator.name}</h2>
            <p className="text-sky-100 text-sm">Booking Request</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Date & Time */}
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-semibold text-gray-900">{formatDate(date)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Trip</p>
              <p className="font-semibold text-gray-900">{slotInfo.label}</p>
              <p className="text-gray-600 text-sm">{slotInfo.time}</p>
            </div>

            <hr className="border-gray-100" />

            {/* Payment Info */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit (authorized)</span>
                <span className="font-semibold text-gray-900">${depositAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remainder (due day of trip)</span>
                <span className="font-semibold text-gray-900">${remainingAmount}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-gray-900">${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="font-semibold text-amber-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-amber-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">1.</span>
              <span>{operator.name} will review your request (usually within a few hours)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">2.</span>
              <span>If confirmed, your deposit will be charged and you&apos;ll receive confirmation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">3.</span>
              <span>If they can&apos;t accommodate, the hold will be released (no charge)</span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Questions? Contact the operator directly:</p>
          <p className="font-medium text-gray-900">{operator.phone}</p>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href={`/book/${slug}`}
            className="text-sky-600 hover:underline text-sm"
          >
            ← Back to {operator.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
