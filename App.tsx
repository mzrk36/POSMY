import React, { useState, useEffect, useCallback } from 'react';
import { Product, Sale, User } from './types';
import * as api from './services/api';

import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Reports from './components/Reports';
import AIAssistant from './components/AIAssistant';
import Admin from './components/Admin';
import LoginScreen from './components/LoginScreen';
import AdminSetupScreen from './components/AdminSetupScreen';

import { AiIcon, AdminIcon, LogoutIcon } from './components/common/Icons';
import { BarChart, Briefcase, LayoutDashboard, ShoppingCart } from 'lucide-react';


type Page = 'dashboard' | 'pos' | 'inventory' | 'reports' | 'ai' | 'admin';
type AppState = 'LOADING' | 'SETUP' | 'LOGIN' | 'APP';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('LOADING');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [page, setPage] = useState<Page>('dashboard');
    
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

    const loadInitialState = useCallback(async () => {
        try {
            const existingUsers = await api.getUsers();
            setUsers(existingUsers);
            const hasOwner = existingUsers.some(u => u.role === 'owner');
            if (hasOwner) {
                setAppState('LOGIN');
            } else {
                setAppState('SETUP');
            }
        } catch (error) {
            handleLoadError(error);
        }
    }, []);

    const loadAppData = useCallback(async () => {
        try {
            setInitialLoadError(null);
            const [fetchedProducts, fetchedSales, fetchedUsers] = await Promise.all([
                api.getProducts(),
                api.getSales(),
                api.getUsers(), // Also fetch users for the admin panel
            ]);
            setProducts(fetchedProducts);
            setSales(fetchedSales);
            setUsers(fetchedUsers);
        } catch (error) {
            handleLoadError(error);
        }
    }, []);

    useEffect(() => {
        if (appState === 'LOADING') {
            loadInitialState();
        }
    }, [appState, loadInitialState]);

    const handleLoadError = (error: unknown) => {
        console.error("Failed to load application data:", error);
        let errorMessage = "An unknown error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        setInitialLoadError(`Failed to load application data: ${errorMessage}`);
        // Fallback to a state where the error can be displayed
        setAppState('LOGIN'); 
    };

    // --- AUTH & SETUP HANDLERS ---
    const handleAdminSetup = async (name: string, pin: string) => {
        const newUser = await api.addUser({ name, pin, role: 'owner' });
        setCurrentUser(newUser);
        setAppState('APP');
        await loadAppData();
    };

    const handleLogin = async (pin: string): Promise<boolean> => {
        const user = await api.loginUser(pin);
        if (user) {
            setCurrentUser(user);
            setAppState('APP');
            if (user.role === 'cashier') {
                setPage('pos');
            } else {
                setPage('dashboard');
            }
            await loadAppData();
            return true;
        }
        return false;
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        setAppState('LOGIN');
    };

    // --- DATA MUTATION HANDLERS ---
    const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
        const newProduct = await api.addProduct(productData);
        setProducts(prev => [...prev, newProduct].sort((a,b) => a.name.localeCompare(b.name)));
    };

    const handleUpdateProduct = async (productData: Product) => {
        const updatedProduct = await api.updateProduct(productData);
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    };
    
    const handleAddSale = async (saleData: Omit<Sale, 'id' | 'date'>): Promise<Sale> => {
        if (!currentUser) throw new Error("No user logged in.");
        const newSale = await api.addSale(saleData, currentUser.id);
        // Reload all data in the background to ensure consistency
        loadAppData(); 
        return newSale;
    };

    const handleAddUser = async (userData: Omit<User, 'id'>) => {
        await api.addUser(userData);
        await loadAppData();
    }
    const handleUpdateUser = async (userData: User) => {
        await api.updateUser(userData);
        await loadAppData();
    }
    const handleDeleteUser = async (userId: string) => {
        await api.deleteUser(userId);
        await loadAppData();
    }

    // --- UI RENDERING ---

    if (appState === 'LOADING') {
        return <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center">Loading Application...</div>;
    }
    
    if (appState === 'SETUP') {
        return <AdminSetupScreen onSetup={handleAdminSetup} />;
    }
    
    if (appState === 'LOGIN' || !currentUser) {
        if(initialLoadError) {
             return <div className="bg-slate-900 text-rose-400 min-h-screen flex flex-col gap-4 items-center justify-center p-8 text-center">
                <h2 className="text-2xl font-bold">Application Error</h2>
                <p className="max-w-xl">{initialLoadError}</p>
                <button onClick={() => { setInitialLoadError(null); setAppState('LOADING'); }} className="mt-4 px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg font-semibold hover:bg-yellow-300 transition">Try Again</button>
            </div>
        }
        return <LoginScreen onLogin={handleLogin} />;
    }

    const renderPage = () => {
        switch (page) {
            case 'dashboard': return <Dashboard products={products} sales={sales} />;
            case 'pos': return <POS products={products} onAddSale={handleAddSale} />;
            case 'inventory': return <Inventory products={products} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} />;
            case 'reports': return <Reports sales={sales} />;
            case 'ai': return <AIAssistant products={products} sales={sales} />;
            case 'admin': return <Admin users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser}/>;
            default: return <Dashboard products={products} sales={sales} />;
        }
    };
    
    const NavItem: React.FC<{ label: string; target: Page; icon?: React.ReactNode }> = ({ label, target, icon }) => (
        <button onClick={() => setPage(target)} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${page === target ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/20' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
            {icon}
            <span className="font-semibold">{label}</span>
        </button>
    );

    const ownerNav = (
        <>
            <NavItem label="Dashboard" target="dashboard" icon={<LayoutDashboard className="w-6 h-6"/>}/>
            <NavItem label="Point of Sale" target="pos" icon={<ShoppingCart className="w-6 h-6"/>} />
            <NavItem label="Inventory" target="inventory" icon={<Briefcase className="w-6 h-6"/>}/>
            <NavItem label="Reports" target="reports" icon={<BarChart className="w-6 h-6"/>} />
            <NavItem label="Admin Panel" target="admin" icon={<AdminIcon className="w-6 h-6"/>} />
            <NavItem label="AI Assistant" target="ai" icon={<AiIcon className="w-6 h-6"/>}/>
        </>
    );
    
    const cashierNav = (
         <>
            <NavItem label="Point of Sale" target="pos" icon={<ShoppingCart className="w-6 h-6"/>} />
        </>
    )

    return (
        <div className="bg-slate-900 text-white min-h-screen flex">
            <nav className="w-64 bg-slate-800 p-4 border-r border-slate-700 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-yellow-400" style={{textShadow: '0 0 5px #facc15'}}>Astra POS</h1>
                </div>
                <div className="space-y-2 flex-grow">
                    {currentUser.role === 'owner' ? ownerNav : cashierNav}
                </div>
                <div className="border-t border-slate-700 pt-4">
                    <div className="text-sm text-slate-400 px-4">
                        <p>Logged in as:</p>
                        <p className="font-bold text-white truncate">{currentUser.name}</p>
                        <p className="capitalize text-yellow-400">{currentUser.role}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 mt-4">
                        <LogoutIcon className="w-6 h-6"/>
                        <span className="font-semibold">Logout</span>
                    </button>
                </div>
            </nav>

            <main className="flex-1 overflow-y-auto h-screen">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;