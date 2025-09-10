import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Product, Sale } from '../types';
import Card from './common/Card';

interface DashboardProps {
    products: Product[];
    sales: Sale[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales }) => {
    const today = new Date().toISOString().split('T')[0];
    const todaysSales = sales.filter(sale => sale.date.startsWith(today));
    const todaysRevenue = todaysSales.reduce((acc, sale) => acc + sale.total, 0);
    const lowStockProducts = products.filter(p => p.stock < 10);

    const productSales = sales
        .flatMap(sale => sale.items)
        .reduce((acc, item) => {
            acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
            return acc;
        }, {} as { [key: string]: number });

    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
        
    const salesData = sales.reduce((acc, sale) => {
        const date = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + sale.total;
        return acc;
    }, {} as {[key: string]: number});
    
    const chartData = Object.entries(salesData).map(([name, total]) => ({name, total})).slice(-7).reverse();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-300 mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <h2 className="text-lg font-semibold text-slate-400">Today's Revenue</h2>
                    <p className="text-4xl font-bold text-white mt-2">${todaysRevenue.toFixed(2)}</p>
                </Card>
                <Card>
                    <h2 className="text-lg font-semibold text-slate-400">Today's Sales</h2>
                    <p className="text-4xl font-bold text-white mt-2">{todaysSales.length}</p>
                </Card>
                <Card>
                    <h2 className="text-lg font-semibold text-slate-400">Low Stock Items</h2>
                    <p className="text-4xl font-bold text-rose-400 mt-2 animate-pulse">{lowStockProducts.length}</p>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-slate-300 mb-4">Weekly Sales Overview</h2>
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    cursor={{fill: 'rgba(250, 204, 21, 0.1)'}}
                                    contentStyle={{ 
                                        backgroundColor: '#0f172a', 
                                        border: '1px solid #334155',
                                        color: '#cbd5e1'
                                    }}
                                />
                                <Bar dataKey="total" fill="#facc15" name="Total Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card>
                    <h2 className="text-xl font-bold text-slate-300 mb-4">Top Selling Products</h2>
                    <ul className="space-y-4">
                        {topProducts.map(([name, quantity]) => (
                            <li key={name} className="flex justify-between items-center transition-all hover:scale-105">
                                <span className="text-slate-400">{name}</span>
                                <span className="font-bold text-slate-900 bg-yellow-400 rounded-full px-3 py-1 text-sm">{quantity} sold</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;