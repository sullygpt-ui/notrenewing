import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, slug, content, meta_description, is_published } = body;

    if (!id || !title || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const serviceClient = await createServiceClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if slug is unique (excluding current page)
    const { data: existingPage } = await serviceClient
      .from('pages')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single();

    if (existingPage) {
      return NextResponse.json({ error: 'A page with this URL already exists' }, { status: 400 });
    }

    // Update the page
    const { error } = await serviceClient
      .from('pages')
      .update({
        title,
        slug,
        content,
        meta_description,
        is_published,
        updated_by: user.id,
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to update page:', error);
      return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Page update error:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, meta_description, is_published } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const serviceClient = await createServiceClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if slug is unique
    const { data: existingPage } = await serviceClient
      .from('pages')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingPage) {
      return NextResponse.json({ error: 'A page with this URL already exists' }, { status: 400 });
    }

    // Create the page
    const { data: newPage, error } = await serviceClient
      .from('pages')
      .insert({
        title,
        slug,
        content: content || '',
        meta_description,
        is_published: is_published ?? false,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create page:', error);
      return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }

    return NextResponse.json({ success: true, page: newPage });
  } catch (error) {
    console.error('Page create error:', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing page ID' }, { status: 400 });
    }

    const supabase = await createClient();
    const serviceClient = await createServiceClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the page
    const { error } = await serviceClient
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete page:', error);
      return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Page delete error:', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
