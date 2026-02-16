"use client";

import { useState } from "react";

interface AddonItem {
  id: string;
  name: string;
  price: number;
  price_type: 'per_person' | 'flat';
  description: string | null;
}

interface BookingCalendarProps {
  operatorSlug: string;
  maxGuests?: number;
  addons?: AddonItem[];
  waiverEnabled?: boolean;
  waiverText?: string | null;
  instantBooking?: boolean;
  tripHoldEnabled?: boolean;
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  const days: (number | null)[] = [];
  for (let i = 0; i < startingDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const mockAvailability: Record<string, string[]> = {
  "2026-02-15": ["half-am", "half-pm", "full"],
  "2026-02-16": ["half-am", "full"],
  "2026-02-17": ["half-pm"],
  "2026-02-18": ["half-am", "half-pm", "full"],
  "2026-02-20": ["half-am", "half-pm", "full"],
  "2026-02-21": ["half-am", "half-pm", "full"],
  "2026-02-22": ["full"],
  "2026-02-25": ["half-am", "half-pm", "full"],
  "2026-02-26": ["half-am", "half-pm", "full"],
  "2026-02-27": ["half-am", "half-pm", "full"],
  "2026-02-28": ["half-am", "half-pm", "full"],
  "2026-03-01": ["half-am", "half-pm", "full"],
  "2026-03-02": ["half-am", "half-pm", "full"],
  "2026-03-03": ["half-am", "full"],
  "2026-03-05": ["half-am", "half-pm", "full"],
  "2026-03-06": ["half-am", "half-pm", "full"],
  "2026-03-07": ["full"],
  "2026-03-08": ["half-am", "half-pm", "full"],
  "2026-03-10": ["half-am", "half-pm", "full"],
  "2026-03-12": ["half-am", "half-pm", "full"],
  "2026-03-14": ["half-am", "half-pm", "full"],
  "2026-03-15": ["half-am", "half-pm", "full"],
};

const SLOT_LABELS: Record<string, { label: string; time: string; price: number }> = {
  "half-am": { label: "Half Day AM", time: "8:00 AM - 12:00 PM", price: 600 },
  "half-pm": { label: "Half Day PM", time: "1:00 PM - 5:00 PM", price: 600 },
  "full": { label: "Full Day", time: "8:00 AM - 5:00 PM", price: 1000 },
};

export default function BookingCalendar({
  operatorSlug,
  maxGuests = 20,
  addons = [],
  waiverEnabled = false,
  waiverText,
  instantBooking = false,
  tripHoldEnabled = false,
}: BookingCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [waiverExpanded, setWaiverExpanded] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    partySize: 1,
  });

  const days = getCalendarDays(currentYear, currentMonth);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const formatDateKey = (day: number) => {
    const month = String(currentMonth + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    return `${currentYear}-${month}-${dayStr}`;
  };

  const isAvailable = (day: number) => {
    const dateKey = formatDateKey(day);
    return mockAvailability[dateKey] && mockAvailability[dateKey].length > 0;
  };

  const isPast = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const handleDateClick = (day: number) => {
    if (!isAvailable(day) || isPast(day)) return;
    const dateKey = formatDateKey(day);
    setSelectedDate(dateKey);
    setSelectedSlot(null);
    setShowForm(false);
  };

  const availableSlots = selectedDate ? mockAvailability[selectedDate] || [] : [];

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setShowForm(true);
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const calculateAddonTotal = () => {
    return addons
      .filter(a => selectedAddons.includes(a.id))
      .reduce((sum, a) => sum + (a.price_type === 'per_person' ? a.price * formData.partySize : a.price), 0);
  };

  const handleBookNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !formData.email) return;
    if (waiverEnabled && !waiverAccepted) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorSlug,
          date: selectedDate,
          slot: selectedSlot,
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          partySize: formData.partySize,
          selectedAddons: selectedAddons,
          waiverAccepted: waiverEnabled ? waiverAccepted : undefined,
          waiverSignerName: waiverEnabled ? formData.name : undefined,
        }),
      });

      const data = await response.json();

      if (data.url || data.checkoutUrl) {
        window.location.href = data.url || data.checkoutUrl;
      } else {
        alert("Error creating checkout session. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error creating checkout session. Please try again.");
      setIsLoading(false);
    }
  };

  const slotPrice = selectedSlot ? SLOT_LABELS[selectedSlot].price : 0;
  const addonTotal = calculateAddonTotal();
  const displayTotal = slotPrice + addonTotal;

  return (
    <div>
      {/* Instant Booking Badge */}
      {instantBooking && (
        <div className="mb-3 flex items-center gap-1 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5">
          <span>⚡</span> Instant Booking
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={goToPrevMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">←</button>
        <span className="font-medium text-gray-900">{MONTH_NAMES[currentMonth]} {currentYear}</span>
        <button onClick={goToNextMonth} className="p-1 hover:bg-gray-100 rounded-full text-gray-600">→</button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {DAY_NAMES.map((day) => (
          <div key={day} className="text-gray-400 text-xs py-1">{day}</div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateKey = formatDateKey(day);
          const available = isAvailable(day);
          const past = isPast(day);
          const selected = selectedDate === dateKey;
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={!available || past}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-colors
                ${past ? "text-gray-300 cursor-not-allowed" : ""}
                ${!past && !available ? "text-gray-400 cursor-not-allowed" : ""}
                ${!past && available && !selected ? "bg-sky-100 text-sky-700 hover:bg-sky-200 cursor-pointer" : ""}
                ${selected ? "bg-sky-600 text-white" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && !showForm && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Available times:</p>
          <div className="space-y-2">
            {availableSlots.map((slot) => {
              const slotInfo = SLOT_LABELS[slot];
              return (
                <button
                  key={slot}
                  onClick={() => handleSlotSelect(slot)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-sky-300 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{slotInfo.label}</p>
                      <p className="text-xs text-gray-500">{slotInfo.time}</p>
                    </div>
                    <span className="font-semibold text-gray-900">${slotInfo.price}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Info Form */}
      {showForm && selectedSlot && (
        <form onSubmit={handleBookNow} className="mt-4 pt-4 border-t border-gray-100">
          <div className="mb-3 p-2 bg-sky-50 rounded-lg">
            <p className="text-sm text-sky-800">
              <span className="font-medium">{SLOT_LABELS[selectedSlot].label}</span>
              <span className="mx-2">•</span>
              <span>${SLOT_LABELS[selectedSlot].price}</span>
            </p>
          </div>

          {/* Add-ons */}
          {addons.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Add-ons:</p>
              {addons.map((addon) => (
                <label key={addon.id} className="flex items-start gap-2 p-2 rounded-lg border border-gray-200 hover:border-sky-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAddons.includes(addon.id)}
                    onChange={() => toggleAddon(addon.id)}
                    className="mt-1 text-sky-600 focus:ring-sky-500"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">{addon.name}</span>
                      <span className="text-sm text-gray-700">
                        ${addon.price}{addon.price_type === 'per_person' ? '/person' : ''}
                      </span>
                    </div>
                    {addon.description && (
                      <p className="text-xs text-gray-500">{addon.description}</p>
                    )}
                  </div>
                </label>
              ))}
              {selectedAddons.length > 0 && (
                <div className="text-sm text-sky-800 bg-sky-50 rounded-lg p-2">
                  Trip total: <span className="font-semibold">${displayTotal}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="john@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (for day-of contact)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Size <span className="text-gray-400 font-normal">(Max {maxGuests} guests)</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={maxGuests}
                value={formData.partySize}
                onChange={(e) => setFormData({ ...formData, partySize: Math.min(Math.max(1, Number(e.target.value)), maxGuests) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          {/* Waiver */}
          {waiverEnabled && waiverText && (
            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setWaiverExpanded(!waiverExpanded)}
                className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>📋 Liability Waiver</span>
                <span>{waiverExpanded ? '▲' : '▼'}</span>
              </button>
              {waiverExpanded && (
                <div className="px-3 pb-3 max-h-40 overflow-y-auto text-xs text-gray-600 whitespace-pre-wrap border-t border-gray-100">
                  {waiverText}
                </div>
              )}
              <div className="px-3 pb-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={waiverAccepted}
                    onChange={(e) => setWaiverAccepted(e.target.checked)}
                    className="mt-0.5 text-sky-600 focus:ring-sky-500"
                    required
                  />
                  <span className="text-xs text-gray-700">
                    I have read and agree to the liability waiver
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Trip Hold Info */}
          {tripHoldEnabled && (
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-800">
                🛡️ A hold of ${displayTotal} will be placed on your card to secure your booking. This is NOT a charge. If you pay cash day-of, the hold is released.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (waiverEnabled && !waiverAccepted)}
            className={`
              w-full mt-4 font-semibold py-3 px-4 rounded-lg transition-colors
              ${isLoading || (waiverEnabled && !waiverAccepted)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-sky-600 hover:bg-sky-700 text-white"
              }
            `}
          >
            {isLoading ? "Redirecting to checkout..." : instantBooking ? "Book Now — Instant Confirmation" : "Book Now — $100 deposit"}
          </button>

          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to time slots
          </button>
        </form>
      )}
    </div>
  );
}
