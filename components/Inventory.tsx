import React, { useState } from 'react';
import { Product } from '../types';
import Card from './common/Card';
import { PlusIcon } from './common/Icons';

interface InventoryProps {
    products: Product[];
    onAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
    onUpdateProduct: (product: Product) => Promise<void>;
}

const ProductModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSave: (product: Omit<Product, 'id'> | Product) => void;
}> = ({ isOpen, onClose, product, onSave }) => {
    const [name, setName] = useState(product?.name || '');
    const [price, setPrice] = useState(product?.price || 0);
    const [stock, setStock] = useState(product?.stock || 0);

    React.useEffect(() => {
        if (isOpen) {
            if (product) {
                setName(product.name);
                setPrice(product.price);
                setStock(product.stock);
            } else {
                setName('');
                setPrice(0);
                setStock(0);
            }
        }
    }, [product, isOpen]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const productData = { name, price: Number(price), stock: Number(stock) };

        if (product) {
            onSave({ ...productData, id: product.id });
        } else {
            onSave(productData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
                <h2 className="text-2xl font-bold mb-6 text-yellow-400">{product ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-slate-400 mb-1">Product Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded bg-slate-900 border-slate-600 text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-slate-400 mb-1">Price</label>
                            <input type="number" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full p-2 border rounded bg-slate-900 border-slate-600 text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400" required />
                        </div>
                        <div>
                            <label className="block text-slate-400 mb-1">Stock</label>
                            <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full p-2 border rounded bg-slate-900 border-slate-600 text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400" required />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition text-white">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg font-semibold hover:bg-yellow-300 transition">{product ? 'Save Changes' : 'Add Product'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onUpdateProduct }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleAddClick = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSave = async (productData: Omit<Product, 'id'> | Product) => {
        if ('id' in productData) {
            await onUpdateProduct(productData as Product);
        } else {
            await onAddProduct(productData as Omit<Product, 'id'>);
        }
    };
    
    const getStockStatus = (stock: number) => {
        if (stock === 0) return <span className="px-2 py-1 text-xs font-semibold text-red-400 bg-red-500/20 rounded-full">Out of Stock</span>;
        if (stock < 10) return <span className="px-2 py-1 text-xs font-semibold text-yellow-400 bg-yellow-500/20 rounded-full">Low Stock</span>;
        return <span className="px-2 py-1 text-xs font-semibold text-green-400 bg-green-500/20 rounded-full">In Stock</span>;
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-300">{'\u00A0'}</h1>
                <button onClick={handleAddClick} className="flex items-center gap-2 bg-yellow-400 text-slate-900 px-4 py-2 rounded-lg shadow-lg shadow-yellow-400/20 hover:bg-yellow-300 transition hover:scale-105 transform">
                    <PlusIcon className="w-5 h-5" />
                    Add Product
                </button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="p-4 text-yellow-400">Product Name</th>
                                <th className="p-4 text-yellow-400">Price</th>
                                <th className="p-4 text-yellow-400">Stock</th>
                                <th className="p-4 text-yellow-400">Status</th>
                                <th className="p-4 text-yellow-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="p-4">
                                        <span className="font-medium text-white">{product.name}</span>
                                    </td>
                                    <td className="p-4 text-slate-400">${product.price.toFixed(2)}</td>
                                    <td className="p-4 text-white font-semibold">{product.stock}</td>
                                    <td className="p-4">{getStockStatus(product.stock)}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleEditClick(product)} className="text-yellow-400 hover:underline">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <ProductModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                onSave={handleSave}
            />
        </div>
    );
};

export default Inventory;
