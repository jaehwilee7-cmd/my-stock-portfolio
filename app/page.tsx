'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Stock {
  id?: number | string;
  broker: string;
  account_name: string;
  symbol: string;
  stock_name: string;
  quantity: number;
  avg_price: number;
  monthly_pnl?: number;
  yearly_pnl?: number;
  dividend_yield?: number;
}

export default function PortfolioPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [quotes, setQuotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchingName, setFetchingName] = useState(false);

  // 폼 상태 관리
  const [formData, setFormData] = useState<Stock>({
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

  // DB 데이터 불러오기
  const fetchPortfolio = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('portfolio').select('*');
    if (error) {
      console.error('Error fetching data:', error);
    } else if (data) {
      setStocks(data);
      // 등록된 종목 시세 불러오기
      const symbols = data.map((item) => item.symbol).filter(Boolean);
      if (symbols.length > 0) {
        fetchQuotes(symbols);
      }
    }
    setLoading(false);
  };

  // 실시간 시세 조회 API 호출
  const fetchQuotes = async (symbols: string[]) => {
    try {
      const res = await fetch(`/api/quote?symbols=${symbols.join(',')}`);
      const result = await res.json();
      if (result.quotes) {
        setQuotes(result.quotes);
      }
    } catch (err) {
      console.error('Failed to fetch quotes:', err);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // 종목코드 입력 시 자동 이름 및 시세 가져오기
  const handleSymbolBlur = async () => {
    const sym = formData.symbol.trim().toUpperCase();
    if (!sym) return;

    setFetchingName(true);
    try {
      const res = await fetch(`/api/quote?symbols=${sym}`);
      const result = await res.json();
      if (result.quotes && result.quotes[sym]) {
        // 가져온 시세 저장
        setQuotes((prev) => ({ ...prev, [sym]: result.quotes[sym] }));
        // 평단가가 0이면 현재가를 기본값으로 자동 제안
        if (formData.avg_price === 0) {
          setFormData((prev) => ({ ...prev, avg_price: result.quotes[sym] }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingName(false);
    }
  };

  // 종목 추가 저장
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symbol || !formData.stock_name) {
      alert('종목코드와 종목명을 입력해 주세요.');
      return;
    }

    const payload = {
      broker: formData.broker || '기타',
      account_name: formData.account_name || '기본계좌',
      symbol: formData.symbol.toUpperCase(),
      stock_name: formData.stock_name,
      quantity: Number(formData.quantity) || 0,
      avg_price: Number(formData.avg_price) || 0,
      monthly_pnl: Number(formData.monthly_pnl) || 0,
      yearly_pnl: Number(formData.yearly_pnl) || 0,
      dividend_yield: Number(formData.dividend_yield) || 0,
    };

    const { error } = await supabase.from('portfolio').insert([payload]);

    if (error) {
      console.error('Save error:', error);
      alert('저장에 실패했습니다: ' + error.message);
    } else {
      alert('성공적으로 저장되었습니다!');
      setIsModalOpen(false);
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
      fetchPortfolio();
    }
  };

  // 종목 삭제
  const handleDelete = async (id: number | string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('portfolio').delete().eq('id', id);
    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      fetchPortfolio();
    }
  };

  // 총 평가금액 계산
  const totalEvaluated = stocks.reduce((acc, item) => {
    const price = quotes[item.symbol] || item.avg_price;
    return acc + price * item.quantity;
  }, 0);

  const totalPurchase = stocks.reduce((acc, item) => {
    return acc + item.avg_price * item.quantity;
  }, 0);

  const totalPnL = totalEvaluated - totalPurchase;
  const totalReturnRate = totalPurchase > 0 ? (totalPnL / totalPurchase) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">주식 포트폴리오 관리</h1>
            <p className="text-sm text-gray-500 mt-1">증권사별·계좌별 자산 현황과 실시간 시세를 통합 관리합니다.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => fetchPortfolio()}
              className="p-2 border rounded-lg hover:bg-gray-50 transition"
              title="새로고침"
            >
              🔄
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              + 종목 추가
            </button>
          </div>
        </div>

        {/* 대시보드 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">총 평가금액</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalEvaluated.toLocaleString()} 원</p>
            <p className="text-xs text-gray-400 mt-1">총 매수금액: {totalPurchase.toLocaleString()} 원</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">총 평가손익 및 수익률</p>
            <p className={`text-3xl font-bold mt-2 ${totalPnL >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString()} 원
            </p>
            <p className={`text-xs font-semibold mt-1 ${totalReturnRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
              수익률 {totalReturnRate >= 0 ? '+' : ''}{totalReturnRate.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">보유 종목 수</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stocks.length} 개</p>
            <p className="text-xs text-gray-400 mt-1">실시간 시세 연동 중</p>
          </div>
        </div>

        {/* 종목 리스트 테이블 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
                  <th className="p-4">증권사 / 계좌</th>
                  <th className="p-4">종목명 (코드)</th>
                  <th className="p-4 text-right">현재가</th>
                  <th className="p-4 text-right">평단가</th>
                  <th className="p-4 text-right">수량</th>
                  <th className="p-4 text-right">평가금액</th>
                  <th className="p-4 text-right">평가손익</th>
                  <th className="p-4 text-right">수익률</th>
                  <th className="p-4 text-center">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8 text-gray-400">데이터를 불러오는 중입니다...</td>
                  </tr>
                ) : stocks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8 text-gray-400">등록된 종목이 없습니다. 오른쪽 위 "+ 종목 추가" 버튼을 눌러주세요.</td>
                  </tr>
                ) : (
                  stocks.map((item) => {
                    const currentPrice = quotes[item.symbol] || item.avg_price;
                    const evalAmount = currentPrice * item.quantity;
                    const buyAmount = item.avg_price * item.quantity;
                    const pnl = evalAmount - buyAmount;
                    const returnRate = buyAmount > 0 ? (pnl / buyAmount) * 100 : 0;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <span className="font-semibold text-gray-800">{item.broker}</span>
                          <span className="text-xs text-gray-400 block">{item.account_name}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-gray-900">{item.stock_name}</span>
                          <span className="text-xs text-blue-600 block">{item.symbol}</span>
                        </td>
                        <td className="p-4 text-right font-medium">{currentPrice.toLocaleString()} 원</td>
                        <td className="p-4 text-right text-gray-600">{item.avg_price.toLocaleString()} 원</td>
                        <td className="p-4 text-right">{item.quantity.toLocaleString()}</td>
                        <td className="p-4 text-right font-semibold">{evalAmount.toLocaleString()} 원</td>
                        <td className={`p-4 text-right font-medium ${pnl >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                          {pnl >= 0 ? '+' : ''}{pnl.toLocaleString()} 원
                        </td>
                        <td className={`p-4 text-right font-medium ${returnRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                          {returnRate >= 0 ? '+' : ''}{returnRate.toFixed(2)}%
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDelete(item.id!)}
                            className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 종목 추가 모달 창 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">신규 종목 추가</h2>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">증권사</label>
                    <input
                      type="text"
                      placeholder="예: 미래에셋, KB"
                      value={formData.broker}
                      onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                      className="w-full border rounded-lg p-2 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">계좌명</label>
                    <input
                      type="text"
                      placeholder="예: ISA, 위탁,연금"
                      value={formData.account_name}
                      onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                      className="w-full border rounded-lg p-2 text-sm mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">종목코드 (야후 파이낸스 기준)</label>
                  <input
                    type="text"
                    placeholder="예: SCHD, 005930.KS, 360750.KS"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    onBlur={handleSymbolBlur}
                    className="w-full border rounded-lg p-2 text-sm mt-1 uppercase"
                    required
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    * 국장 주식/ETF는 뒤에 .KS 붙임 (예: 삼성전자 005930.KS, TIGER 미국배당다우존스 360750.KS)
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">종목명</label>
                  <input
                    type="text"
                    placeholder="예: 미국배당 다우존스, 삼성전자"
                    value={formData.stock_name}
                    onChange={(e) => setFormData({ ...formData, stock_name: e.target.value })}
                    className="w-full border rounded-lg p-2 text-sm mt-1"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">보유수량</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.quantity || ''}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="w-full border rounded-lg p-2 text-sm mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">평단가 (원)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.avg_price || ''}
                      onChange={(e) => setFormData({ ...formData, avg_price: Number(e.target.value) })}
                      className="w-full border rounded-lg p-2 text-sm mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
