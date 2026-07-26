import { NextResponse } from 'next/server';
// yahoo-finance2 대신 CJS 모듈을 직접 불러와 번들러 추적 방지
import yahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');

  if (!symbolsParam) {
    return NextResponse.json({ quotes: {} });
  }

  const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase());
  const quotes: Record<string, number> = {};

  try {
    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        const quote = await yahooFinance.quote(symbol);
        return { symbol, price: quote.regularMarketPrice || quote.postMarketPrice || 0 };
      })
    );

    results.forEach((res) => {
      if (res.status === 'fulfilled' && res.value) {
        quotes[res.value.symbol] = res.value.price;
      }
    });

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ quotes: {} }, { status: 500 });
  }
}
