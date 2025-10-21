import { NextRequest, NextResponse } from 'next/server';
import { fetchDailyPrices } from '@/lib/alphavantage';
import { normalizeDailyPrices } from '@/lib/normalize';

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
    const result = await fetchDailyPrices(symbol);
    const normalized = normalizeDailyPrices(result.data);

    if (!normalized || normalized.length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch price data' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: normalized,
      metadata: result.metadata,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch price data' },
      { status: 500 }
    );
  }
}

