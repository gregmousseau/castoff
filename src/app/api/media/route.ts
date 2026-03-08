import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { deleteFromGCS, isGCSConfigured } from '@/lib/gcs'

// GET - fetch all media for the current operator
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: operator } = await adminClient
      .from('operators')
      .select('id, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!operator) return NextResponse.json({ error: 'Operator not found' }, { status: 404 })

    const { data: media } = await adminClient
      .from('operator_media')
      .select('*')
      .eq('operator_id', operator.id)
      .order('sort_order', { ascending: true })

    return NextResponse.json({ media: media || [] })
  } catch (error) {
    console.error('Media fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

// PATCH - update media (role, caption, reorder)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: operator } = await adminClient
      .from('operators')
      .select('id, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!operator) return NextResponse.json({ error: 'Operator not found' }, { status: 404 })

    const body = await request.json()

    // Reorder: { action: 'reorder', items: [{ id, sort_order }] }
    if (body.action === 'reorder' && Array.isArray(body.items)) {
      for (const item of body.items) {
        await adminClient
          .from('operator_media')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id)
          .eq('operator_id', operator.id)
      }
      return NextResponse.json({ ok: true })
    }

    // Set role: { action: 'set_role', id, role }
    if (body.action === 'set_role' && body.id && body.role) {
      const validRoles = ['hero', 'thumbnail', 'gallery']
      if (!validRoles.includes(body.role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }

      // If setting hero or thumbnail, clear that role from other media
      if (body.role === 'hero' || body.role === 'thumbnail') {
        await adminClient
          .from('operator_media')
          .update({ role: 'gallery' })
          .eq('operator_id', operator.id)
          .eq('role', body.role)
      }

      // Set the new role
      const { data: updated } = await adminClient
        .from('operator_media')
        .update({ role: body.role })
        .eq('id', body.id)
        .eq('operator_id', operator.id)
        .select('url')
        .single()

      // Update operator columns
      if (updated) {
        if (body.role === 'hero') {
          await adminClient
            .from('operators')
            .update({ hero_image: updated.url })
            .eq('id', operator.id)
        } else if (body.role === 'thumbnail') {
          await adminClient
            .from('operators')
            .update({ thumbnail_image: updated.url })
            .eq('id', operator.id)
        }
      }

      return NextResponse.json({ ok: true })
    }

    // Update caption: { action: 'caption', id, caption }
    if (body.action === 'caption' && body.id) {
      await adminClient
        .from('operator_media')
        .update({ caption: body.caption || null })
        .eq('id', body.id)
        .eq('operator_id', operator.id)

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Media update error:', error)
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
  }
}

// DELETE - remove a media item
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminClient = createAdminClient()
    const { data: operator } = await adminClient
      .from('operators')
      .select('id, is_admin')
      .eq('user_id', user.id)
      .single()

    if (!operator) return NextResponse.json({ error: 'Operator not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')
    if (!mediaId) return NextResponse.json({ error: 'Missing media id' }, { status: 400 })

    // Get the media record first
    const { data: media } = await adminClient
      .from('operator_media')
      .select('*')
      .eq('id', mediaId)
      .eq('operator_id', operator.id)
      .single()

    if (!media) return NextResponse.json({ error: 'Media not found' }, { status: 404 })

    // Delete from storage
    if (isGCSConfigured() && media.storage_key) {
      await deleteFromGCS(media.storage_key)
    } else if (media.storage_key) {
      await adminClient.storage.from('photos').remove([media.storage_key])
    }

    // If this was hero or thumbnail, clear the operator column
    if (media.role === 'hero') {
      await adminClient
        .from('operators')
        .update({ hero_image: null })
        .eq('id', operator.id)
    } else if (media.role === 'thumbnail') {
      await adminClient
        .from('operators')
        .update({ thumbnail_image: null })
        .eq('id', operator.id)
    }

    // Delete the record
    await adminClient
      .from('operator_media')
      .delete()
      .eq('id', mediaId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Media delete error:', error)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}
