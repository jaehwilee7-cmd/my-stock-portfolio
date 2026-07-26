'use client';

export const dynamic = 'force-dynamic'; // <--- 이 줄이 빌드 시 Prerender 에러를 막아줍니다.

import { useEffect, useState } from 'react';
import { StockWithQuote } from '@/types';
import { getPortfolioData, addStockItem, updateStockItem, deleteStockItem } from './actions';
import DashboardSummary from '@/components/DashboardSummary';
import StockTable from '@/components/StockTable';
import StockFormModal from '@/components/StockFormModal';
import { Plus, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [items, setItems] = useState<StockWithQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockWithQuote | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const rawData = await getPortfolioData();
      if (!rawData || rawData.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const symbols = Array.from(new Set(rawData.map((i) => i.symbol))).join(',');
      const res = await fetch(`/api/quote?symbols=${encodeURIComponent(symbols)}`);
      const quoteData = await res.json();
      const quotes = quoteData.quotes || {};

      const combined: StockWithQuote[] = rawData.map((item) => {
        const currentPrice = quotes[item.symbol.toUpperCase()] || item.avg_price;
        const totalValue = item.quantity * currentPrice;
        const totalCost = item.quantity * item.avg_price;
        const pnl = totalValue - totalCost;
        const returnRate = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

        return {
          ...item,
          currentPrice,
          totalValue,
          pnl,
          returnRate,
        };
      });

      setItems(combined);
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrUpdate = async (formData: any) => {
    if (editingItem) {
      await updateStockItem(editingItem.id, formData);
    } else {
      await addStockItem(formData);
    }
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteStockItem(id);
      await fetchData();
    }
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: StockWithQuote) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 영역 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">주식 포트폴리오 관리</h1>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">
              증권사별·계좌별 자산 현황과 실시간 시세를 통합 관리합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="p-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> 종목 추가
            </button>
          </div>
        </div>

        {/* 요약 대시보드 및 테이블 */}
        {loading ? (
          <div className="py-20 text-center text-zinc-400 text-sm">데이터를 불러오는 중입니다...</div>
        ) : (
          <>
            <DashboardSummary items={items} />
            <StockTable items={items} onEdit={handleOpenEditModal} onDelete={handleDelete} />
          </>
        )}

        {/* 모달 */}
        <StockFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateOrUpdate}
          initialData={editingItem}
        />
      </div>
    </main>
  );
}
