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

    // Verify user owns an operator
    const { data: operator } = await adminClient
      .from('operators')
      .select('id, slug')
      .eq('user_id', user.id)
      .single()

    if (!operator) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string || 'photo' // 'hero' | 'photo'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type (images + videos)
    const allowedTypes = ['image/', 'video/']
    if (!allowedTypes.some(t => file.type.startsWith(t))) {
      return NextResponse.json({ error: 'Only image and video files are allowed' }, { status: 400 })
    }

    // Max 50MB for videos, 10MB for images
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      const maxLabel = file.type.startsWith('video/') ? '50MB' : '10MB'
      return NextResponse.json({ error: `File too large (max ${maxLabel})` }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const folder = `operators/${operator.slug}/${type}`

    // Try GCS first, fall back to Supabase Storage
    if (isGCSConfigured()) {
      const result = await uploadToGCS(fileBuffer, fileName, file.type, folder)
      return NextResponse.json({ url: result.url, key: result.key })
    }

    // Fallback: Supabase Storage
    const storagePath = `${folder}/${Date.now()}-${fileName}`
    const { error: uploadError } = await adminClient.storage
      .from('photos')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = adminClient.storage
      .from('photos')
      .getPublicUrl(storagePath)

    // If hero image, update operator record
    if (type === 'hero') {
      await adminClient
        .from('operators')
        .update({ hero_image: publicUrl })
        .eq('id', operator.id)
    }

    return NextResponse.json({ url: publicUrl, key: storagePath })
  } catch (error) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
