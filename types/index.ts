export interface StockItem {
  id: string;
  broker: string;
  account_name: string;
  symbol: string;
  stock_name: string;
  quantity: number;
  avg_price: number;
  monthly_pnl: number;
  yearly_pnl: number;
  dividend_yield: number;
  created_at?: string;
}

export interface StockWithQuote extends StockItem {
  currentPrice: number;
  totalValue: number;
  pnl: number;
  returnRate: number;
}
