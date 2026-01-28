import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's books, ordered by created_at descending
    const { data: books, error } = await supabase
      .from('books')
      .select('id, title, created_at, job_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching books:', error);
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }

    return NextResponse.json({ books: books || [] });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
