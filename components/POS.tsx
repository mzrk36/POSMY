import React, { useState, useMemo } from 'react';
import { Product, CartItem, Sale } from '../types';
import Card from './common/Card';
import { PlusIcon, MinusIcon, TrashIcon } from './common/Icons';

interface POSProps {
  products: Product[];
  onAddSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<Sale>;
}

const POS: React.FC<POSProps> = ({ products, onAddSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedSale, setProcessedSale] = useState<Sale | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch && p.stock > 0;
    });
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
            return prevCart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        }
        return prevCart; // Do not add more than available in stock
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCart(prevCart => {
        const itemToUpdate = prevCart.find(item => item.id === productId);
        if(!itemToUpdate) return prevCart;

        if (newQuantity <= 0) {
            return prevCart.filter(item => item.id !== productId);
        }
        if (newQuantity > itemToUpdate.stock) {
            return prevCart.map(item => item.id === productId ? {...item, quantity: itemToUpdate.stock} : item);
        }
        return prevCart.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
        );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };
  
  const clearCart = () => {
    setCart([]);
  }

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);
  
  const taxRate = 0.08; // 8% tax
  const cartTax = cartSubtotal * taxRate;
  const cartTotal = cartSubtotal + cartTax;

  const handleProcessSale = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    const newSaleData: Omit<Sale, 'id'|'date'> = {
        items: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price,
        })),
        total: cartTotal,
        tax: cartTax,
    };
    
    try {
        const finalSale = await onAddSale(newSaleData);
        setProcessedSale(finalSale);
        setCart([]);
    } catch(error) {
        console.error("Failed to complete sale:", error);
        alert("Error completing sale. Please try again.");
    } finally {
        setIsProcessing(false);
        setIsConfirming(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    if (!processedSale) return;
    const receiptLines = [
        `Sale ID: ${processedSale.id}`,
        `Date: ${new Date(processedSale.date).toLocaleString()}`,
        '--------------------------------',
        ...processedSale.items.map(item => 
            `${item.productName} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
        ),
        '--------------------------------',
        `Subtotal: $${((processedSale.total || 0) - (processedSale.tax || 0)).toFixed(2)}`,
        `Tax: $${processedSale.tax.toFixed(2)}`,
        `Total: $${processedSale.total.toFixed(2)}`,
    ];
    const receiptText = receiptLines.join('\n');
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${processedSale.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">Confirm Sale</h2>
        <p className="text-slate-400 mb-6">Are you sure you want to process this sale?</p>
        <div className="bg-slate-900/50 p-4 rounded-lg mb-6">
            <div className="flex justify-between text-2xl font-bold text-white">
                <span>Total Amount:</span>
                <span className="text-yellow-400">${cartTotal.toFixed(2)}</span>
            </div>
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={() => setIsConfirming(false)} disabled={isProcessing} className="px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition text-white disabled:opacity-50">Cancel</button>
          <button onClick={handleProcessSale} disabled={isProcessing} className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-400 transition disabled:opacity-50">
            {isProcessing ? 'Processing...' : 'Confirm & Process'}
          </button>
        </div>
      </div>
    </div>
  );

 const renderReceiptModal = () => (
    <div id="receipt-modal" className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-sm border border-slate-700">
        <h2 className="text-2xl font-bold mb-4 text-center text-yellow-400">Sale Complete!</h2>
        <div className="bg-slate-900 p-4 rounded-lg my-4 text-sm font-mono text-slate-300 space-y-1">
          <p>Sale ID: {processedSale?.id}</p>
          <p>Date: {new Date(processedSale?.date || '').toLocaleString()}</p>
          <hr className="border-slate-600 my-2"/>
          {processedSale?.items.map(item => (
            <div key={item.productId} className="flex justify-between">
              <span>{item.productName} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr className="border-slate-600 my-2"/>
           <div className="flex justify-between font-bold">
              <span>Subtotal:</span>
              <span>${((processedSale?.total || 0) - (processedSale?.tax || 0)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
              <span>Tax:</span>
              <span>${(processedSale?.tax || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-yellow-400">
              <span>Total:</span>
              <span>${(processedSale?.total || 0).toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between gap-4 mt-6 no-print">
          <button onClick={handlePrintReceipt} className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition">Print Receipt</button>
          <button onClick={handleDownloadReceipt} className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-400 transition">Download</button>
        </div>
        <button onClick={() => setProcessedSale(null)} className="w-full mt-4 px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition text-white no-print">Close</button>
      </div>
    </div>
  );


  return (
    <div className="flex h-screen">
      {/* Product List */}
      <div className="w-3/5 p-6 flex flex-col">
        <div className="mb-6">
            <input 
                type="text" 
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg bg-slate-900 border-slate-600 text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
            />
        </div>
        <div className="flex-grow overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <Card key={product.id} onClick={() => addToCart(product)} className="cursor-pointer hover:border-yellow-400 transition-all hover:scale-105 transform p-4 flex flex-col">
              <div className="aspect-square bg-slate-700 rounded-md mb-3 flex items-center justify-center text-yellow-400/50"></div>
              <h3 className="font-bold text-white truncate">{product.name}</h3>
              <p className="font-bold text-yellow-400 mt-auto pt-2">${product.price.toFixed(2)}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-2/5 bg-slate-800 border-l border-slate-700 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-slate-300 mb-4">Current Order</h2>
        <div className="flex-grow overflow-y-auto -mr-2 pr-2">
            {cart.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                    <p>Your cart is empty.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {cart.map(item => (
                        <li key={item.id} className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-4">
                            <div className="flex-grow">
                                <p className="font-semibold text-white">{item.name}</p>
                                <p className="text-sm text-slate-400">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-slate-700 hover:bg-slate-600"><MinusIcon className="w-4 h-4 text-white" /></button>
                                <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-slate-700 hover:bg-slate-600"><PlusIcon className="w-4 h-4 text-white" /></button>
                            </div>
                            <p className="font-bold text-white w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromCart(item.id)} className="text-rose-500 hover:text-rose-400"><TrashIcon className="w-5 h-5" /></button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <div className="border-t border-slate-700 pt-4 mt-4">
          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">${cartSubtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax ({(taxRate * 100).toFixed(0)}%)</span><span className="font-semibold">${cartTax.toFixed(2)}</span></div>
            <div className="flex justify-between text-2xl font-bold text-white mt-2"><span>Total</span><span className="text-yellow-400">${cartTotal.toFixed(2)}</span></div>
          </div>
          <div className="mt-6 flex gap-2">
            <button onClick={clearCart} disabled={cart.length === 0} className="w-1/3 py-3 bg-rose-600/80 text-white rounded-lg font-semibold hover:bg-rose-600 disabled:bg-slate-600 transition">Clear</button>
            <button onClick={() => setIsConfirming(true)} disabled={cart.length === 0} className="w-2/3 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-400 disabled:bg-slate-600 transition">Process Sale</button>
          </div>
        </div>
      </div>
      {isConfirming && renderConfirmationModal()}
      {processedSale && renderReceiptModal()}
    </div>
  );
};

export default POS;