import { NextRequest, NextResponse } from 'next/server';
import { fetchOverview } from '@/lib/alphavantage';
import { normalizeOverview } from '@/lib/normalize';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  try {
    const result = await fetchOverview(symbol);
    const normalized = normalizeOverview(result.data);

    if (!normalized) {
      return NextResponse.json(
        { error: 'Failed to fetch company overview' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: normalized,
      metadata: result.metadata,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch company overview' },
      { status: 500 }
    );
  }
}

