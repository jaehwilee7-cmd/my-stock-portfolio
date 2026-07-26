import { NextResponse } from 'next/server';
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
        // @ts-ignore - yahoo-finance2 v2의 엄격한 this 타입 검사 우회
        const quote = await yahooFinance.quote(symbol);
        const price = (quote as any)?.regularMarketPrice || (quote as any)?.postMarketPrice || 0;
        return { symbol, price };
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
