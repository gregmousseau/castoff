"use client";

import { useState, useEffect, useCallback } from "react";

interface AddonItem {
  id: string;
  name: string;
  price: number;
  price_type: 'per_person' | 'flat';
  description: string | null;
}

interface PricingSlot {
  id: string;
  trip_type: string;
  display_name: string;
  duration_hours: number | null;
  base_price: number;
  deposit_amount: number;
  included_guests: number | null;
  extra_person_fee: number;
  custom_start_time: boolean;
  default_start_time: string;
}

interface BookingCalendarProps {
  operatorSlug: string;
  maxGuests?: number;
  addons?: AddonItem[];
  waiverEnabled?: boolean;
  waiverText?: string | null;
  instantBooking?: boolean;
  tripHoldEnabled?: boolean;
  pricing?: PricingSlot[];
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

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

export default function BookingCalendar({
  operatorSlug,
  maxGuests = 20,
  addons = [],
  waiverEnabled = false,
  waiverText,
  instantBooking = false,
  tripHoldEnabled = false,
  pricing = [],
}: BookingCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<PricingSlot | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [waiverExpanded, setWaiverExpanded] = useState(false);
  const [availability, setAvailability] = useState<Record<string, string[]>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [requestedStartTime, setRequestedStartTime] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    partySize: 1,
  });

  const fetchAvailability = useCallback(async (year: number, month: number) => {
    setAvailabilityLoading(true);
    try {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      const res = await fetch(`/api/booking/availability?slug=${operatorSlug}&start=${startDate}&end=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        setAvailability(data.availability || {});
      } else {
        // If API not available, mark all future dates as available with all pricing slots
        const fallback: Record<string, string[]> = {};
        const todayDate = new Date();
        for (let d = 1; d <= lastDay; d++) {
          const date = new Date(year, month, d);
          if (date >= todayDate) {
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            fallback[key] = pricing.map(p => p.trip_type);
          }
        }
        setAvailability(fallback);
      }
    } catch {
      // Fallback: mark future dates as available
      const lastDay = new Date(year, month + 1, 0).getDate();
      const fallback: Record<string, string[]> = {};
      const todayDate = new Date();
      for (let d = 1; d <= lastDay; d++) {
        const date = new Date(year, month, d);
        if (date >= todayDate) {
          const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          fallback[key] = pricing.map(p => p.trip_type);
        }
      }
      setAvailability(fallback);
    } finally {
      setAvailabilityLoading(false);
    }
  }, [operatorSlug, pricing]);

  useEffect(() => {
    fetchAvailability(currentYear, currentMonth);
  }, [currentYear, currentMonth, fetchAvailability]);

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
    return availability[dateKey] && availability[dateKey].length > 0;
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

  const availableSlotTypes = selectedDate ? availability[selectedDate] || [] : [];
  const availablePricing = pricing.filter(p => availableSlotTypes.includes(p.trip_type));

  const handleSlotSelect = (slot: PricingSlot) => {
    setSelectedSlot(slot);
    setRequestedStartTime(slot.default_start_time || "09:00");
    setShowForm(true);
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => {
      if (prev.includes(addonId)) {
        const newQuantities = { ...addonQuantities };
        delete newQuantities[addonId];
        setAddonQuantities(newQuantities);
        return prev.filter(id => id !== addonId);
      } else {
        // Default quantity: party size for per_person, 1 for flat
        const addon = addons.find(a => a.id === addonId);
        if (addon?.price_type === 'per_person') {
          setAddonQuantities(q => ({ ...q, [addonId]: formData.partySize }));
        }
        return [...prev, addonId];
      }
    });
  };

  const getAddonQuantity = (addonId: string): number => {
    return addonQuantities[addonId] ?? formData.partySize;
  };

  const calculateAddonTotal = () => {
    return addons
      .filter(a => selectedAddons.includes(a.id))
      .reduce((sum, a) => {
        if (a.price_type === 'per_person') {
          const qty = getAddonQuantity(a.id);
          return sum + a.price * qty;
        }
        return sum + a.price;
      }, 0);
  };

  const calculateExtraPersonFee = () => {
    if (!selectedSlot || !selectedSlot.included_guests) return 0;
    const extraGuests = Math.max(0, formData.partySize - selectedSlot.included_guests);
    return extraGuests * selectedSlot.extra_person_fee;
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
          tripDate: selectedDate,
          tripType: selectedSlot.trip_type,
          customerEmail: formData.email,
          customerName: formData.name,
          customerPhone: formData.phone,
          partySize: formData.partySize,
          selectedAddons: selectedAddons,
          requestedStartTime: selectedSlot.custom_start_time ? requestedStartTime : undefined,
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

  const extraPersonFee = calculateExtraPersonFee();
  const slotPrice = selectedSlot ? selectedSlot.base_price + extraPersonFee : 0;
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
        {availabilityLoading ? (
          <div className="col-span-7 py-8 text-center text-gray-400 text-sm">Loading availability...</div>
        ) : (
          days.map((day, i) => {
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
          })
        )}
      </div>

      {/* Time Slots from pricing records */}
      {selectedDate && !showForm && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">Available trips:</p>
          <div className="space-y-2">
            {availablePricing.map((slot) => (
              <button
                key={slot.id}
                onClick={() => handleSlotSelect(slot)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-sky-300 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{slot.display_name}</p>
                    <p className="text-xs text-gray-500">
                      {slot.duration_hours ? `${slot.duration_hours} hours` : ''}
                      {slot.default_start_time ? ` · Starts ${formatTime(slot.default_start_time)}` : ''}
                    </p>
                    {slot.included_guests && (
                      <p className="text-xs text-sky-600 mt-0.5">
                        Price covers {slot.included_guests} guests
                        {slot.extra_person_fee > 0 && ` · $${slot.extra_person_fee}/extra guest`}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">${Number(slot.base_price).toLocaleString()}</span>
                </div>
              </button>
            ))}
            {availablePricing.length === 0 && (
              <p className="text-sm text-gray-400">No trips available for this date.</p>
            )}
          </div>
        </div>
      )}

      {/* Customer Info Form */}
      {showForm && selectedSlot && (
        <form onSubmit={handleBookNow} className="mt-4 pt-4 border-t border-gray-100">
          <div className="mb-3 p-2 bg-sky-50 rounded-lg">
            <p className="text-sm text-sky-800">
              <span className="font-medium">{selectedSlot.display_name}</span>
              <span className="mx-2">·</span>
              <span>${Number(selectedSlot.base_price).toLocaleString()}</span>
            </p>
            {selectedSlot.included_guests && (
              <p className="text-xs text-sky-600 mt-1">
                Up to {selectedSlot.included_guests} guests included
              </p>
            )}
          </div>

          {/* Custom Start Time */}
          {selectedSlot.custom_start_time && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Start Time
              </label>
              <input
                type="time"
                value={requestedStartTime}
                onChange={(e) => setRequestedStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Default: {formatTime(selectedSlot.default_start_time)}. You may request a different time.
              </p>
            </div>
          )}

          {/* Add-ons */}
          {addons.length > 0 && (
            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Add-ons:</p>
              {addons.map((addon) => {
                const isChecked = selectedAddons.includes(addon.id);
                const qty = getAddonQuantity(addon.id);
                return (
                  <div key={addon.id} className={`p-2 rounded-lg border transition-colors ${isChecked ? 'border-sky-300 bg-sky-50/50' : 'border-gray-200 hover:border-sky-200'}`}>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
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
                    {isChecked && addon.price_type === 'per_person' && (
                      <div className="mt-2 ml-6 flex items-center gap-2">
                        <label className="text-xs text-gray-600">How many?</label>
                        <input
                          type="number"
                          min={1}
                          max={formData.partySize}
                          value={qty}
                          onChange={(e) => {
                            const val = Math.min(Math.max(1, Number(e.target.value)), formData.partySize);
                            setAddonQuantities(q => ({ ...q, [addon.id]: val }));
                          }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-sky-500"
                        />
                        <span className="text-xs text-gray-500">of {formData.partySize} guests · ${addon.price * qty}</span>
                      </div>
                    )}
                  </div>
                );
              })}
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

          {/* Per-person pricing breakdown */}
          {selectedSlot.included_guests && formData.partySize > selectedSlot.included_guests && (
            <div className="mt-3 p-3 bg-sky-50 rounded-lg text-sm text-sky-800">
              <p className="font-medium mb-1">Price breakdown:</p>
              <p>Base: ${Number(selectedSlot.base_price).toLocaleString()} (up to {selectedSlot.included_guests} guests)</p>
              <p>+ {formData.partySize - selectedSlot.included_guests} extra guest{formData.partySize - selectedSlot.included_guests > 1 ? 's' : ''} × ${selectedSlot.extra_person_fee} = ${extraPersonFee.toLocaleString()}</p>
              <p className="font-semibold mt-1">Trip total: ${displayTotal.toLocaleString()}</p>
            </div>
          )}

          {/* Total with addons */}
          {(selectedAddons.length > 0 || extraPersonFee > 0) && !(selectedSlot.included_guests && formData.partySize > selectedSlot.included_guests) && (
            <div className="mt-3 text-sm text-sky-800 bg-sky-50 rounded-lg p-2">
              Trip total: <span className="font-semibold">${displayTotal.toLocaleString()}</span>
            </div>
          )}

          {/* Waiver */}
          {waiverEnabled && waiverText && (
            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setWaiverExpanded(!waiverExpanded)}
                className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>Liability Waiver</span>
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
                A hold of ${displayTotal.toLocaleString()} will be placed on your card to secure your booking. This is NOT a charge. If you pay cash day-of, the hold is released.
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
            {isLoading ? "Redirecting to checkout..." : instantBooking ? "Book Now — Instant Confirmation" : `Book Now — $${selectedSlot.deposit_amount} deposit`}
          </button>

          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to trip options
          </button>
        </form>
      )}
    </div>
  );
}
