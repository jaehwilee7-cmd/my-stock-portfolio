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
        // yahooFinance 모듈 객체에 함수를 직접 바인딩하여 타입 에러 해결
        const quoteFn = yahooFinance.quote.bind(yahooFinance);
        const quote = await quoteFn(symbol);
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
