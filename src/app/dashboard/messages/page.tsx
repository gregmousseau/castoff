'use client'

import { useEffect, useState } from 'react'

interface Message {
  id: string
  booking_id: string | null
  operator_id: string
  sender_type: string
  sender_name: string | null
  sender_email: string | null
  message: string
  read_at: string | null
  created_at: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    fetch('/api/messages')
      .then(res => res.ok ? res.json() : [])
      .then(setMessages)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function sendReply(msg: Message) {
    if (!replyText.trim()) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operator_id: msg.operator_id,
          booking_id: msg.booking_id,
          sender_type: 'operator',
          sender_name: 'Operator',
          message: replyText,
        }),
      })
      if (res.ok) {
        const newMsg = await res.json()
        setMessages(prev => [newMsg, ...prev])
        setReplyTo(null)
        setReplyText('')
      }
    } catch {
      alert('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-500">Customer inquiries and conversations.</p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      msg.sender_type === 'customer' ? 'bg-sky-100 text-sky-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {msg.sender_type === 'customer' ? 'Customer' : 'You'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{msg.sender_name || 'Unknown'}</span>
                    {msg.sender_email && (
                      <span className="text-xs text-gray-500">{msg.sender_email}</span>
                    )}
                  </div>
                  <p className="mt-2 text-gray-700 text-sm">{msg.message}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{formatDate(msg.created_at)}</span>
              </div>

              {msg.sender_type === 'customer' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {replyTo === msg.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        onClick={() => sendReply(msg)}
                        disabled={sending}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 px-4 rounded-lg disabled:opacity-50"
                      >
                        {sending ? '...' : 'Send'}
                      </button>
                      <button
                        onClick={() => { setReplyTo(null); setReplyText('') }}
                        className="text-sm text-gray-500 hover:text-gray-700 px-2"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyTo(msg.id)}
                      className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                    >
                      Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
