"use client";

import { useState } from "react";

interface BookingCalendarProps {
  operatorSlug: string;
  maxGuests?: number;
}

// Generate calendar days for a month
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days: (number | null)[] = [];

  // Add empty cells for days before the first of the month
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Mock availability - in production this comes from database
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
  // March dates
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

export default function BookingCalendar({ operatorSlug, maxGuests = 20 }: BookingCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleBookNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !formData.email) return;

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
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
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

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goToPrevMonth}
          className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
        >
          ←
        </button>
        <span className="font-medium text-gray-900">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded-full text-gray-600"
        >
          →
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {/* Day Headers */}
        {DAY_NAMES.map((day) => (
          <div key={day} className="text-gray-400 text-xs py-1">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }

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

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="john@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (for day-of contact)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full mt-4 font-semibold py-3 px-4 rounded-lg transition-colors
              ${isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-sky-600 hover:bg-sky-700 text-white"
              }
            `}
          >
            {isLoading ? "Redirecting to checkout..." : "Book Now — $100 deposit"}
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
