'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface MediaItem {
  id: string
  url: string
  storage_key: string
  media_type: 'photo' | 'video'
  content_type: string
  role: 'hero' | 'thumbnail' | 'gallery'
  caption: string | null
  sort_order: number
  file_size: number
  created_at: string
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [dragItem, setDragItem] = useState<number | null>(null)
  const [dragOverItem, setDragOverItem] = useState<number | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: MediaItem } | null>(null)
  const [editingCaption, setEditingCaption] = useState<string | null>(null)
  const [captionText, setCaptionText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/media')
      if (res.ok) {
        const data = await res.json()
        setMedia(data.media || [])
      }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMedia() }, [fetchMedia])

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener('click', handler)
      return () => document.removeEventListener('click', handler)
    }
  }, [contextMenu])

  async function uploadFiles(files: File[]) {
    const validFiles = files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'))
    if (validFiles.length === 0) return

    setUploading(true)
    for (let i = 0; i < validFiles.length; i++) {
      setUploadProgress(`Uploading ${i + 1} of ${validFiles.length}...`)
      const formData = new FormData()
      formData.append('file', validFiles[i])
      formData.append('type', 'gallery')
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!res.ok) {
          const err = await res.json()
          alert(`Failed to upload ${validFiles[i].name}: ${err.error}`)
        }
      } catch {
        alert(`Failed to upload ${validFiles[i].name}`)
      }
    }
    setUploading(false)
    setUploadProgress('')
    fetchMedia()
  }

  async function setRole(id: string, role: string) {
    try {
      await fetch('/api/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_role', id, role }),
      })
      fetchMedia()
    } catch { alert('Failed to update') }
  }

  async function deleteMedia(id: string) {
    if (!confirm('Delete this media? This cannot be undone.')) return
    try {
      await fetch(`/api/media?id=${id}`, { method: 'DELETE' })
      fetchMedia()
    } catch { alert('Failed to delete') }
  }

  async function saveCaption(id: string) {
    try {
      await fetch('/api/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'caption', id, caption: captionText }),
      })
      setEditingCaption(null)
      fetchMedia()
    } catch { alert('Failed to save caption') }
  }

  async function handleDragEnd() {
    if (dragItem === null || dragOverItem === null || dragItem === dragOverItem) {
      setDragItem(null)
      setDragOverItem(null)
      return
    }

    const reordered = [...media]
    const [removed] = reordered.splice(dragItem, 1)
    reordered.splice(dragOverItem, 0, removed)

    // Update sort_order
    const items = reordered.map((m, i) => ({ id: m.id, sort_order: i }))
    setMedia(reordered.map((m, i) => ({ ...m, sort_order: i })))
    setDragItem(null)
    setDragOverItem(null)

    try {
      await fetch('/api/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', items }),
      })
    } catch { fetchMedia() }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const heroItem = media.find(m => m.role === 'hero')
  const thumbnailItem = media.find(m => m.role === 'thumbnail')

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media</h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload photos and videos. Drag to reorder. Right-click to set as hero or thumbnail.
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {uploading ? uploadProgress : '+ Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            if (files.length > 0) uploadFiles(files)
            e.target.value = ''
          }}
        />
      </div>

      {/* Role indicators */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">🖼 Hero Image</h3>
            <span className="text-xs text-gray-400">Banner on booking page</span>
          </div>
          {heroItem ? (
            <div className="relative h-32 rounded-lg overflow-hidden bg-gray-100">
              <img src={heroItem.url} alt="Hero" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-32 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400">
              No hero set. Right-click a photo below.
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">📋 Thumbnail</h3>
            <span className="text-xs text-gray-400">Directory card + social sharing</span>
          </div>
          {thumbnailItem ? (
            <div className="relative h-32 rounded-lg overflow-hidden bg-gray-100">
              <img src={thumbnailItem.url} alt="Thumbnail" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-32 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400">
              No thumbnail set. Right-click a photo below.
            </div>
          )}
        </div>
      </div>

      {/* Upload drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const files = Array.from(e.dataTransfer.files).filter(
            f => f.type.startsWith('image/') || f.type.startsWith('video/')
          )
          if (files.length > 0) uploadFiles(files)
        }}
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
          dragOver ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <p className="text-sm text-gray-500">
          {uploading ? uploadProgress : 'Drag & drop photos and videos here, or click the Upload button'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Images up to 10MB, videos up to 50MB</p>
      </div>

      {/* Media grid */}
      {media.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <p className="text-gray-500">No media uploaded yet. Upload your first photo or video above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {media.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragItem(idx)}
              onDragEnter={() => setDragOverItem(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onContextMenu={(e) => {
                e.preventDefault()
                setContextMenu({ x: e.clientX, y: e.clientY, item })
              }}
              className={`relative group aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing border-2 transition-all ${
                dragOverItem === idx ? 'border-teal-500 scale-105' : 'border-transparent'
              }`}
            >
              {item.media_type === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />
              )}

              {/* Role badge */}
              {item.role !== 'gallery' && (
                <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                  item.role === 'hero'
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-blue-400 text-blue-900'
                }`}>
                  {item.role === 'hero' ? '⭐ Hero' : '📋 Thumb'}
                </span>
              )}

              {/* Video badge */}
              {item.media_type === 'video' && (
                <span className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-black/60 text-white">
                  ▶ Video
                </span>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                <div className="w-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingCaption === item.id ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={captionText}
                        onChange={(e) => setCaptionText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveCaption(item.id) }}
                        className="flex-1 text-xs px-2 py-1 rounded bg-white text-gray-900"
                        placeholder="Caption..."
                        autoFocus
                      />
                      <button
                        onClick={() => saveCaption(item.id)}
                        className="text-xs px-2 py-1 bg-teal-500 text-white rounded"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs text-white truncate cursor-pointer"
                        onClick={() => {
                          setEditingCaption(item.id)
                          setCaptionText(item.caption || '')
                        }}
                      >
                        {item.caption || 'Add caption...'}
                      </span>
                      <span className="text-xs text-white/70 ml-1">{formatSize(item.file_size)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => { e.stopPropagation(); deleteMedia(item.id) }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                style={{ display: item.media_type === 'video' ? undefined : undefined }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => { setRole(contextMenu.item.id, 'hero'); setContextMenu(null) }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            ⭐ Set as Hero
          </button>
          <button
            onClick={() => { setRole(contextMenu.item.id, 'thumbnail'); setContextMenu(null) }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            📋 Set as Thumbnail
          </button>
          {contextMenu.item.role !== 'gallery' && (
            <button
              onClick={() => { setRole(contextMenu.item.id, 'gallery'); setContextMenu(null) }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              ↩ Remove Role
            </button>
          )}
          <hr className="my-1 border-gray-100" />
          <button
            onClick={() => {
              setEditingCaption(contextMenu.item.id)
              setCaptionText(contextMenu.item.caption || '')
              setContextMenu(null)
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            ✏️ Edit Caption
          </button>
          <button
            onClick={() => { deleteMedia(contextMenu.item.id); setContextMenu(null) }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  )
}
