import React, { useState, useEffect, useCallback } from 'react';
import { Product, Sale } from './types';
import * as api from './services/api';

import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import AIAssistant from './components/AIAssistant';

import { AiIcon } from './components/common/Icons';
import { BarChart, Briefcase, LayoutDashboard, ShoppingCart } from 'lucide-react';


type Page = 'dashboard' | 'pos' | 'inventory' | 'reports' | 'ai';

const App: React.FC = () => {
    const [page, setPage] = useState<Page>('dashboard');
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);

    const [loading, setLoading] = useState(true);
    const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setInitialLoadError(null);
            
            const [fetchedProducts, fetchedSales] = await Promise.all([
                api.getProducts(),
                api.getSales(),
            ]);
            
            setProducts(fetchedProducts);
            setSales(fetchedSales);

        } catch (error) {
            console.error("Failed to load initial data:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setInitialLoadError(`Failed to load application data: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);


    // Data mutation handlers
    const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
        const newProduct = await api.addProduct(productData);
        setProducts(prev => [...prev.filter(p => p.id !== newProduct.id), newProduct].sort((a,b) => a.name.localeCompare(b.name)));
    };

    const handleUpdateProduct = async (productData: Product) => {
        const updatedProduct = await api.updateProduct(productData);
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };
    
    const handleAddSale = async (saleData: Omit<Sale, 'id' | 'date'>): Promise<Sale> => {
        const newSale = await api.addSale(saleData);
        // Reload all data in the background to ensure consistency
        // With mock API this also updates the stock display correctly
        loadData(); 
        return newSale;
    };

    const renderPage = () => {
        switch (page) {
            case 'dashboard':
                return <Dashboard products={products} sales={sales} />;
            case 'pos':
                return <POS products={products} onAddSale={handleAddSale} />;
            case 'inventory':
                return <Inventory products={products} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} />;
            case 'reports':
                return <Reports sales={sales} />;
            case 'ai':
                return <AIAssistant products={products} sales={sales} />;
            default:
                return <Dashboard products={products} sales={sales} />;
        }
    };
    
    const NavItem: React.FC<{ label: string; target: Page; icon?: React.ReactNode }> = ({ label, target, icon }) => (
        <button onClick={() => setPage(target)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${page === target ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/20' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
            {icon}
            <span className="font-semibold">{label}</span>
        </button>
    );

    if (loading) {
        return <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center">Loading...</div>;
    }
    
    if(initialLoadError) {
        return <div className="bg-slate-900 text-rose-400 min-h-screen flex items-center justify-center p-8 text-center whitespace-pre-wrap">{initialLoadError}</div>
    }

    const fullNav = (
        <>
            <NavItem label="Dashboard" target="dashboard" icon={<LayoutDashboard className="w-6 h-6"/>}/>
            <NavItem label="Point of Sale" target="pos" icon={<ShoppingCart className="w-6 h-6"/>} />
            <NavItem label="Inventory" target="inventory" icon={<Briefcase className="w-6 h-6"/>}/>
            <NavItem label="Reports" target="reports" icon={<BarChart className="w-6 h-6"/>} />
            <NavItem label="AI Assistant" target="ai" icon={<AiIcon className="w-6 h-6"/>}/>
        </>
    );

    return (
        <div className="bg-slate-900 text-white min-h-screen flex">
            {/* Sidebar */}
            <nav className="w-64 bg-slate-800 p-4 border-r border-slate-700 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-yellow-400" style={{textShadow: '0 0 5px #facc15'}}>Astra POS</h1>
                </div>
                <div className="space-y-2 flex-grow">
                    {fullNav}
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;