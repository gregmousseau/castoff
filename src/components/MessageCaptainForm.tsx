"use client";

import { useState } from "react";

interface MessageCaptainFormProps {
  operatorId: string;
  operatorName: string;
}

export default function MessageCaptainForm({ operatorId, operatorName }: MessageCaptainFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operator_id: operatorId,
          sender_type: "customer",
          sender_name: formData.name,
          sender_email: formData.email,
          message: formData.message,
        }),
      });
      if (res.ok) {
        setSent(true);
        setFormData({ name: "", email: "", message: "" });
      }
    } catch {
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="p-3 bg-green-50 rounded-lg text-sm text-green-800">
        ✓ Message sent to {operatorName}! They&apos;ll get back to you soon.
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
      >
        💬 Message the Captain
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        required
        placeholder="Your name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-sky-500"
      />
      <input
        type="email"
        required
        placeholder="Your email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-sky-500"
      />
      <textarea
        required
        placeholder="Your message..."
        rows={3}
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-sky-500"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={sending}
          className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Message"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-sm text-gray-500 hover:text-gray-700 px-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
