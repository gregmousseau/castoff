"use client";

import { useState, useEffect, use } from "react";

interface Booking {
  id: string;
  paymentIntentId: string;
  date: string;
  slot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  status: "pending" | "confirmed" | "declined";
  createdAt: string;
}

const SLOT_LABELS: Record<string, string> = {
  "half-am": "Half Day AM (8am-12pm)",
  "half-pm": "Half Day PM (1pm-5pm)",
  "full": "Full Day (8am-5pm)",
};

// Mock data for demo - in production this comes from database
const mockBookings: Booking[] = [
  {
    id: "1",
    paymentIntentId: "pi_demo_123",
    date: "2026-02-20",
    slot: "half-am",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    customerPhone: "+1 555-123-4567",
    amount: 100,
    status: "pending",
    createdAt: "2026-02-11T20:30:00Z",
  },
  {
    id: "2",
    paymentIntentId: "pi_demo_456",
    date: "2026-02-22",
    slot: "full",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    customerPhone: "+1 555-987-6543",
    amount: 100,
    status: "pending",
    createdAt: "2026-02-11T19:15:00Z",
  },
];

export default function AdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [processing, setProcessing] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleAction = async (bookingId: string, action: "confirm" | "decline") => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setProcessing(bookingId);

    try {
      const response = await fetch(`/api/booking/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId: booking.paymentIntentId }),
      });

      const data = await response.json();

      if (data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, status: action === "confirm" ? "confirmed" : "declined" }
              : b
          )
        );
        alert(data.message);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Action error:", error);
      alert("Failed to process action");
    } finally {
      setProcessing(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const processedBookings = bookings.filter((b) => b.status !== "pending");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Booking Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your charter bookings</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Pending Bookings */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Requests ({pendingBookings.length})
          </h2>

          {pendingBookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
              No pending booking requests
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 bg-amber-50">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-800 font-medium">
                        ⏳ Awaiting your response
                      </span>
                      <span className="text-sm text-gray-500">
                        Deposit: ${booking.amount}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-semibold">{formatDate(booking.date)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Trip</p>
                        <p className="font-semibold">{SLOT_LABELS[booking.slot]}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-semibold">{booking.customerName}</p>
                        <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-semibold">{booking.customerPhone || "—"}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(booking.id, "confirm")}
                        disabled={processing === booking.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {processing === booking.id ? "Processing..." : "✓ Confirm Booking"}
                      </button>
                      <button
                        onClick={() => handleAction(booking.id, "decline")}
                        disabled={processing === booking.id}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        ✕ Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Processed Bookings */}
        {processedBookings.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-2">
              {processedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`
                    bg-white rounded-lg border p-4 flex items-center justify-between
                    ${booking.status === "confirmed" ? "border-green-200" : "border-gray-200"}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm
                        ${booking.status === "confirmed"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-500"
                        }
                      `}
                    >
                      {booking.status === "confirmed" ? "✓" : "✕"}
                    </span>
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(booking.date)} • {SLOT_LABELS[booking.slot]}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`
                      text-sm font-medium px-2 py-1 rounded
                      ${booking.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                      }
                    `}
                  >
                    {booking.status === "confirmed" ? "Confirmed" : "Declined"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          <p className="font-semibold mb-1">🔧 Demo Mode</p>
          <p>
            This is a demo admin page. In production, bookings will come from the database
            and actions will capture/cancel real Stripe payments.
          </p>
        </div>
      </main>
    </div>
  );
}
