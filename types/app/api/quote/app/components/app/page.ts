'use client';

import { useState, useEffect, useCallback } from 'react';
import { StockItem, StockWithQuote } from '@/types';
import { getPortfolioData, addStockItem, updateStockItem, deleteStockItem } from './actions';
import DashboardSummary from '@/components/DashboardSummary';
import StockTable from '@/components/StockTable';
import StockFormModal from '@/components/StockFormModal';
import { Plus, RefreshCw } from 'lucide-react';

export default function Home() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [itemsWithQuote, setItemsWithQuote] = useState<StockWithQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await getPortfolioData();
    setItems(data);

    if (data.length > 0) {
      const symbols = Array.from(new Set(data.map((d) => d.symbol))).join(',');
      try {
        const res = await fetch(`/api/quote?symbols=${symbols}`);
        const { quotes } = await res.json();

        const calculated = data.map((item) => {
          const currentPrice = quotes[item.symbol] || item.avg_price;
          const totalValue = item.quantity * currentPrice;
          const pnl = (currentPrice - item.avg_price) * item.quantity;
          const returnRate = item.avg_price > 0 ? ((currentPrice - item.avg_price) / item.avg_price) * 100 : 0;

          return {
            ...item,
            currentPrice,
            totalValue,
            pnl,
            returnRate,
          };
        });

        setItemsWithQuote(calculated);
      } catch (err) {
        console.error('시세 데이터를 불러오지 못했습니다.', err);
      }
    } else {
      setItemsWithQuote([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (formData: Omit<StockItem, 'id'>) => {
    await addStockItem(formData);
    fetchData();
  };

  const handleUpdate = async (formData: Omit<StockItem, 'id'>) => {
    if (editingItem) {
      await updateStockItem(editingItem.id, formData);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('해당 종목을 삭제하시겠습니까?')) {
      await deleteStockItem(id);
      fetchData();
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">자산 관리 포트폴리오</h1>
            <p className="text-sm text-zinc-500 mt-1">실시간 시세 기반 자산 및 수익률 트래킹</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition"
            >
              <Plus className="w-4 h-4" /> 종목 추가
            </button>
          </div>
        </div>

        {/* Dashboard Section */}
        <DashboardSummary items={itemsWithQuote} />

        {/* Table/List Section */}
        <StockTable
          items={itemsWithQuote}
          onEdit={(item) => {
            setEditingItem(item);
            setIsModalOpen(true);
          }}
          onDelete={handleDelete}
        />

        {/* Modal Component */}
        <StockFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={editingItem ? handleUpdate : handleCreate}
          initialData={editingItem}
        />
      </div>
    </main>
  );
}
