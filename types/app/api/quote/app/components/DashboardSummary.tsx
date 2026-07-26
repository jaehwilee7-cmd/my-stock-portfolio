'use client';

import { StockWithQuote } from '@/types';
import { Wallet, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

interface Props {
  items: StockWithQuote[];
}

export default function DashboardSummary({ items }: Props) {
  const totalValue = items.reduce((acc, cur) => acc + cur.totalValue, 0);
  const totalCost = items.reduce((acc, cur) => acc + cur.quantity * cur.avg_price, 0);
  const totalPnl = totalValue - totalCost;
  const totalReturnRate = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  // 증권사별 비중 계산
  const brokerAllocation = items.reduce((acc, cur) => {
    acc[cur.broker] = (acc[cur.broker] || 0) + cur.totalValue;
    return acc;
  }, {} as Record<string, number>);

  // 계좌별 비중 계산
  const accountAllocation = items.reduce((acc, cur) => {
    acc[cur.account_name] = (acc[cur.account_name] || 0) + cur.totalValue;
    return acc;
  }, {} as Record<string, number>);

  const isPositive = totalPnl >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Total Assets & PnL Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between text-zinc-500 mb-2">
          <span className="text-sm font-medium">총 평가금액</span>
          <Wallet className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {totalValue.toLocaleString('ko-KR')}원
        </div>
        <div className="mt-3 flex items-center text-xs text-zinc-500">
          총 매수금액: <span className="ml-1 font-medium text-zinc-700 dark:text-zinc-300">{totalCost.toLocaleString('ko-KR')}원</span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between text-zinc-500 mb-2">
          <span className="text-sm font-medium">총 평가손익 및 수익률</span>
          {isPositive ? (
            <TrendingUp className="w-5 h-5 text-red-500" />
          ) : (
            <TrendingDown className="w-5 h-5 text-blue-500" />
          )}
        </div>
        <div className={`text-2xl font-bold ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
          {isPositive ? '+' : ''}
          {totalPnl.toLocaleString('ko-KR')}원
        </div>
        <div className={`mt-3 text-xs font-semibold ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
          수익률 {isPositive ? '+' : ''}
          {totalReturnRate.toFixed(2)}%
        </div>
      </div>

      {/* Allocation Summary */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between text-zinc-500 mb-2">
          <span className="text-sm font-medium">자산 비중 요약</span>
          <PieChart className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="space-y-2 mt-1">
          <div>
            <p className="text-xs font-semibold text-zinc-400 mb-1">증권사별</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(brokerAllocation).map(([broker, val]) => {
                const ratio = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : '0';
                return (
                  <span key={broker} className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded">
                    {broker}: {ratio}%
                  </span>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 mb-1">계좌별</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(accountAllocation).map(([acc, val]) => {
                const ratio = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : '0';
                return (
                  <span key={acc} className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded">
                    {acc}: {ratio}%
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
