'use client';

import { useState } from 'react';
import { StockWithQuote } from '@/types';
import { Edit2, Trash2, Filter } from 'lucide-react';

interface Props {
  items: StockWithQuote[];
  onEdit: (item: StockWithQuote) => void;
  onDelete: (id: string) => void;
}

export default function StockTable({ items, onEdit, onDelete }: Props) {
  const [selectedBroker, setSelectedBroker] = useState<string>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');

  const brokers = Array.from(new Set(items.map((i) => i.broker)));
  const accounts = Array.from(new Set(items.map((i) => i.account_name)));

  const filteredItems = items.filter((item) => {
    const matchBroker = selectedBroker === 'ALL' || item.broker === selectedBroker;
    const matchAccount = selectedAccount === 'ALL' || item.account_name === selectedAccount;
    return matchBroker && matchAccount;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      {/* Filtering Section */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
          <Filter className="w-4 h-4" /> 필터
        </div>
        <select
          value={selectedBroker}
          onChange={(e) => setSelectedBroker(e.target.value)}
          className="text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-zinc-800"
        >
          <option value="ALL">전체 증권사</option>
          {brokers.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="text-xs border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-zinc-800"
        >
          <option value="ALL">전체 계좌</option>
          {accounts.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* PC Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">증권사/계좌</th>
              <th className="px-4 py-3">종목명 (코드)</th>
              <th className="px-4 py-3 text-right">현재가</th>
              <th className="px-4 py-3 text-right">평단가</th>
              <th className="px-4 py-3 text-right">수량</th>
              <th className="px-4 py-3 text-right">평가금액</th>
              <th className="px-4 py-3 text-right">평가손익</th>
              <th className="px-4 py-3 text-right">수익률</th>
              <th className="px-4 py-3 text-right">월/연 손익</th>
              <th className="px-4 py-3 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredItems.map((item) => {
              const isPositive = item.pnl >= 0;
              return (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{item.broker}</div>
                    <div className="text-xs text-zinc-400">{item.account_name}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">{item.stock_name}</div>
                    <div className="text-xs text-zinc-400">{item.symbol}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium">{item.currentPrice.toLocaleString()}원</td>
                  <td className="px-4 py-3.5 text-right text-zinc-500">{item.avg_price.toLocaleString()}원</td>
                  <td className="px-4 py-3.5 text-right font-medium">{item.quantity}</td>
                  <td className="px-4 py-3.5 text-right font-semibold">{item.totalValue.toLocaleString()}원</td>
                  <td className={`px-4 py-3.5 text-right font-semibold ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
                    {isPositive ? '+' : ''}{item.pnl.toLocaleString()}원
                  </td>
                  <td className={`px-4 py-3.5 text-right font-bold ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
                    {isPositive ? '+' : ''}{item.returnRate.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3.5 text-right text-xs text-zinc-500">
                    <div>월: {item.monthly_pnl.toLocaleString()}원</div>
                    <div>연: {item.yearly_pnl.toLocaleString()}원</div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button onClick={() => onEdit(item)} className="p-1 text-zinc-400 hover:text-zinc-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(item.id)} className="p-1 text-zinc-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
        {filteredItems.map((item) => {
          const isPositive = item.pnl >= 0;
          return (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded mr-1">
                    {item.broker}
                  </span>
                  <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded">
                    {item.account_name}
                  </span>
                  <h3 className="font-bold text-base mt-1 text-zinc-900 dark:text-zinc-100">{item.stock_name}</h3>
                  <p className="text-xs text-zinc-400">{item.symbol}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onEdit(item)} className="p-1.5 text-zinc-400">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(item.id)} className="p-1.5 text-zinc-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-y border-zinc-100 dark:border-zinc-800/60 py-2">
                <div>
                  <span className="text-zinc-400">현재가:</span> <span className="font-semibold">{item.currentPrice.toLocaleString()}원</span>
                </div>
                <div>
                  <span className="text-zinc-400">평단가:</span> <span>{item.avg_price.toLocaleString()}원</span>
                </div>
                <div>
                  <span className="text-zinc-400">수량:</span> <span>{item.quantity}</span>
                </div>
                <div>
                  <span className="text-zinc-400">평가금액:</span> <span className="font-semibold">{item.totalValue.toLocaleString()}원</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-1">
                <div className="text-xs text-zinc-400">
                  월손익: {item.monthly_pnl.toLocaleString()}원
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
                    {isPositive ? '+' : ''}{item.pnl.toLocaleString()}원 ({isPositive ? '+' : ''}{item.returnRate.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
