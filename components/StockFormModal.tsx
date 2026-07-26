'use client';

import { useState, useEffect } from 'react';
import { StockWithQuote } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  initialData?: StockWithQuote | null;
}

export default function StockFormModal({ isOpen, onClose, onSubmit, initialData }: Props) {
  const [formData, setFormData] = useState({
    broker: '',
    account_name: '',
    account_type: '일반',
    symbol: '',
    stock_name: '',
    quantity: 0,
    avg_price: 0,
    currency: 'KRW',
    monthly_pnl: 0,
    yearly_pnl: 0,
    dividend_yield: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        broker: initialData.broker || '',
        account_name: initialData.account_name || '',
        account_type: initialData.account_type || '일반',
        symbol: initialData.symbol || '',
        stock_name: (initialData as any).stock_name || (initialData as any).name || '',
        quantity: initialData.quantity || 0,
        avg_price: initialData.avg_price || 0,
        currency: initialData.currency || 'KRW',
        monthly_pnl: (initialData as any).monthly_pnl || 0,
        yearly_pnl: (initialData as any).yearly_pnl || 0,
        dividend_yield: (initialData as any).dividend_yield || 0,
      });
    } else {
      setFormData({
        broker: '',
        account_name: '',
        account_type: '일반',
        symbol: '',
        stock_name: '',
        quantity: 0,
        avg_price: 0,
        currency: 'KRW',
        monthly_pnl: 0,
        yearly_pnl: 0,
        dividend_yield: 0,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <h2 className="text-xl font-bold mb-4">{initialData ? '종목 정보 수정' : '새 종목 추가'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">증권사</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-lg bg-transparent text-sm"
              value={formData.broker}
              onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
              placeholder="예: 미래에셋, NH투자"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">계좌명</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-lg bg-transparent text-sm"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              placeholder="예: ISA, 위탁계좌"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">티커 / 종목코드</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-lg bg-transparent text-sm"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                placeholder="예: SCHD, 005930.KS"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">종목명</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded-lg bg-transparent text-sm"
                value={formData.stock_name}
                onChange={(e) => setFormData({ ...formData, stock_name: e.target.value })}
                placeholder="예: 미국배당다우존스"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">수량</label>
              <input
                type="number"
                step="any"
                required
                className="w-full p-2 border rounded-lg bg-transparent text-sm"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">평균 단가</label>
              <input
                type="number"
                step="any"
                required
                className="w-full p-2 border rounded-lg bg-transparent text-sm"
                value={formData.avg_price}
                onChange={(e) => setFormData({ ...formData, avg_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
