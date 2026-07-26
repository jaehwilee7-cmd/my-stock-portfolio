'use client';

import { useState, useEffect } from 'react';
import { StockItem } from '@/types';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<StockItem, 'id'>) => Promise<void>;
  initialData?: StockItem | null;
}

export default function StockFormModal({ isOpen, onClose, onSubmit, initialData }: Props) {
  const [formData, setFormData] = useState({
    broker: '',
    account_name: '',
    symbol: '',
    stock_name: '',
    quantity: 0,
    avg_price: 0,
    monthly_pnl: 0,
    yearly_pnl: 0,
    dividend_yield: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        broker: initialData.broker,
        account_name: initialData.account_name,
        symbol: initialData.symbol,
        stock_name: initialData.stock_name,
        quantity: initialData.quantity,
        avg_price: initialData.avg_price,
        monthly_pnl: initialData.monthly_pnl,
        yearly_pnl: initialData.yearly_pnl,
        dividend_yield: initialData.dividend_yield,
      });
    } else {
      setFormData({
        broker: '',
        account_name: '',
        symbol: '',
        stock_name: '',
        quantity: 0,
        avg_price: 0,
        monthly_pnl: 0,
        yearly_pnl: 0,
        dividend_yield: 0,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
          {initialData ? '종목 정보 수정' : '새 종목 추가'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">증권사명</label>
              <input
                type="text"
                required
                value={formData.broker}
                onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                placeholder="예: 미래에셋"
                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">계좌명</label>
              <input
                type="text"
                required
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="예: ISA 계좌"
                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">티커/종목코드</label>
              <input
                type="text"
                required
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="예: SCHD 또는 005930.KS"
                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">종목명</label>
              <input
                type="text"
                required
                value={formData.stock_name}
                onChange={(e) => setFormData({ ...formData, stock_name: e.target.value })}
                placeholder="예: 삼성전자"
                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">보유주식수</label>
              <input
                type="number"
                step="any"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">평단가</label>
              <input
                type="number"
                step="any"
                required
                value={formData.avg_price}
                onChange={(e) => setFormData({ ...formData, avg_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">월손익</label>
              <input
                type="number"
                value={formData.monthly_pnl}
                onChange={(e) => setFormData({ ...formData, monthly_pnl: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">연간손익</label>
              <input
                type="number"
                value={formData.yearly_pnl}
                onChange={(e) => setFormData({ ...formData, yearly_pnl: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">배당수익</label>
              <input
                type="number"
                value={formData.dividend_yield}
                onChange={(e) => setFormData({ ...formData, dividend_yield: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
