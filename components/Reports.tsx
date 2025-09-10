import React, { useState, useMemo } from 'react';
import { Sale } from '../types';
import Card from './common/Card';

interface ReportsProps {
  sales: Sale[];
}

type FilterType = 'all' | 'today' | 'week' | 'month';

const Reports: React.FC<ReportsProps> = ({ sales }) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredSales = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (filter) {
      case 'today':
        return sales.filter(s => new Date(s.date) >= today);
      case 'week':
        return sales.filter(s => new Date(s.date) >= startOfWeek);
      case 'month':
        return sales.filter(s => new Date(s.date) >= startOfMonth);
      case 'all':
      default:
        return sales;
    }
  }, [sales, filter]);

  const totalRevenue = useMemo(() => filteredSales.reduce((acc, sale) => acc + sale.total, 0), [filteredSales]);
  const totalSalesCount = filteredSales.length;
  const averageSaleValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  const FilterButton: React.FC<{ type: FilterType; label: string }> = ({ type, label }) => (
    <button
      onClick={() => setFilter(type)}
      className={`px-4 py-2 rounded-lg font-semibold transition ${
        filter === type ? 'bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-300 mb-8">Sales Reports</h1>
      <div className="flex gap-2 mb-6">
        <FilterButton type="all" label="All Time" />
        <FilterButton type="today" label="Today" />
        <FilterButton type="week" label="This Week" />
        <FilterButton type="month" label="This Month" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <h2 className="text-lg font-semibold text-slate-400">Total Revenue</h2>
          <p className="text-4xl font-bold text-white mt-2">${totalRevenue.toFixed(2)}</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-400">Total Sales</h2>
          <p className="text-4xl font-bold text-white mt-2">{totalSalesCount}</p>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-400">Average Sale Value</h2>
          <p className="text-4xl font-bold text-white mt-2">${averageSaleValue.toFixed(2)}</p>
        </Card>
      </div>
      <Card>
        <h2 className="text-xl font-bold text-slate-300 mb-4">Sales History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-4 text-yellow-400">Sale ID</th>
                <th className="p-4 text-yellow-400">Date</th>
                <th className="p-4 text-yellow-400">Items</th>
                <th className="p-4 text-yellow-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length > 0 ? (
                filteredSales.map(sale => (
                  <tr key={sale.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="p-4 text-slate-400 font-mono text-sm">{sale.id}</td>
                    <td className="p-4 text-slate-400">{new Date(sale.date).toLocaleString()}</td>
                    <td className="p-4 text-slate-400">{sale.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
                    <td className="p-4 text-white font-semibold">${sale.total.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-slate-500">No sales found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;