import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');

  if (!symbolsParam) {
    return NextResponse.json({ error: 'Symbols parameter is required' }, { status: 400 });
  }

  const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase());

  try {
    const quotes: Record<string, number> = {};

    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const result = await yahooFinance.quoteSummary(symbol, {
            modules: ['price'],
          });
          quotes[symbol] = result.price?.regularMarketPrice ?? 0;
        } catch {
          quotes[symbol] = 0;
        }
      })
    );

    return NextResponse.json({ quotes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quote data' }, { status: 500 });
  }
}
