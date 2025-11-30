import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UsageService } from '@/src/modules/usage/usage.service';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get branch limits using UsageService
    const result = await UsageService.checkUsageLimit(user.id, 'branch');

    return NextResponse.json({
      currentCount: result.current,
      maxBranches: result.limit,
      allowed: result.allowed,
      percentage: result.percentage,
    });
  } catch (error: any) {
    console.error('Error fetching branch limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branch limits' },
      { status: 500 }
    );
  }
}
