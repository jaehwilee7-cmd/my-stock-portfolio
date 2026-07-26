export interface StockItem {
  id: string;
  broker: string;
  account_name: string;
  account_type?: string;
  symbol: string;
  stock_name?: string;
  name?: string;
  quantity: number;
  avg_price: number;
  currency?: 'KRW' | 'USD';
  monthly_pnl?: number;
  user_id?: string;
  created_at?: string;
}

export interface StockWithQuote extends StockItem {
  currentPrice: number;
  totalValue: number;
  pnl: number;
  returnRate: number;
}
