import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { uploadToGCS, isGCSConfigured } from '@/lib/gcs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Verify user owns an operator (or is admin)
    const { data: operator } = await adminClient
      .from('operators')
      .select('id, slug, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 })
    }

    // If admin, check for operator override
    const targetSlug = operator.is_admin
      ? (request.headers.get('x-operator-slug') || operator.slug)
      : operator.slug

    let targetOperator = operator
    if (targetSlug !== operator.slug && operator.is_admin) {
      const { data: target } = await adminClient
        .from('operators')
        .select('id, slug')
        .eq('slug', targetSlug)
        .single()
      if (target) targetOperator = { ...target, is_admin: true }
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string || 'gallery' // 'hero' | 'thumbnail' | 'gallery'
    const caption = formData.get('caption') as string || null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type (images + videos)
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) {
      return NextResponse.json({ error: 'Only image and video files are allowed' }, { status: 400 })
    }

    // Max 50MB for videos, 10MB for images
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      const maxLabel = isVideo ? '50MB' : '10MB'
      return NextResponse.json({ error: `File too large (max ${maxLabel})` }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const folder = `operators/${targetOperator.slug}/media`

    let url: string
    let storageKey: string

    if (isGCSConfigured()) {
      const result = await uploadToGCS(fileBuffer, fileName, file.type, folder)
      url = result.url
      storageKey = result.key
    } else {
      // Fallback: Supabase Storage
      storageKey = `${folder}/${Date.now()}-${fileName}`
      const { error: uploadError } = await adminClient.storage
        .from('photos')
        .upload(storageKey, fileBuffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
      }

      const { data: { publicUrl } } = adminClient.storage
        .from('photos')
        .getPublicUrl(storageKey)
      url = publicUrl
    }

    // Get current max sort_order for this operator
    const { data: maxOrder } = await adminClient
      .from('operator_media')
      .select('sort_order')
      .eq('operator_id', targetOperator.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrder?.sort_order ?? -1) + 1

    // If setting as hero or thumbnail, clear that role from other media first
    if (type === 'hero' || type === 'thumbnail') {
      await adminClient
        .from('operator_media')
        .update({ role: 'gallery' })
        .eq('operator_id', targetOperator.id)
        .eq('role', type)
    }

    // Insert into operator_media
    const { data: media, error: mediaError } = await adminClient
      .from('operator_media')
      .insert({
        operator_id: targetOperator.id,
        url,
        storage_key: storageKey,
        media_type: isVideo ? 'video' : 'photo',
        content_type: file.type,
        role: type,
        caption,
        sort_order: nextOrder,
        file_size: file.size,
      })
      .select()
      .single()

    if (mediaError) {
      console.error('Media insert error:', mediaError)
      return NextResponse.json({ error: 'Failed to save media record' }, { status: 500 })
    }

    // Update operator's hero_image or thumbnail_image column
    if (type === 'hero') {
      await adminClient
        .from('operators')
        .update({ hero_image: url })
        .eq('id', targetOperator.id)
    } else if (type === 'thumbnail') {
      await adminClient
        .from('operators')
        .update({ thumbnail_image: url })
        .eq('id', targetOperator.id)
    }

    return NextResponse.json({
      id: media.id,
      url,
      key: storageKey,
      role: type,
      sort_order: nextOrder,
    })
  } catch (error) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
