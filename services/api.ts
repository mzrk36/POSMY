import { Product, Sale } from '../types';

// --- MOCK DATABASE ---
let mockProducts: Product[] = [
    { id: '1', name: 'Burger', price: 5.99, stock: 50 },
    { id: '2', name: 'Fries', price: 2.49, stock: 100 },
    { id: '3', name: 'Coke', price: 1.99, stock: 75 },
    { id: '4', name: 'Iced Tea', price: 2.29, stock: 60 },
    { id: '5', name: 'Coffee', price: 1.50, stock: 80 },
];

let mockSales: Sale[] = [];
let nextSaleId = 1;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API FUNCTIONS ---

// PRODUCTS
export const getProducts = async (): Promise<Product[]> => {
    await delay(100);
    return [...mockProducts];
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    await delay(100);
    const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
    };
    mockProducts.push(newProduct);
    return newProduct;
};

export const updateProduct = async (product: Product): Promise<Product> => {
    await delay(100);
    mockProducts = mockProducts.map(p => p.id === product.id ? product : p);
    return product;
};

// SALES
export const getSales = async (): Promise<Sale[]> => {
    await delay(100);
    return [...mockSales];
};

export const addSale = async (sale: Omit<Sale, 'id' | 'date'>): Promise<Sale> => {
    await delay(200);

    // Simulate stock decrement
    sale.items.forEach(item => {
        const productIndex = mockProducts.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
            mockProducts[productIndex].stock -= item.quantity;
        }
    });

    const newSale: Sale = {
        ...sale,
        id: `sale-${nextSaleId++}`,
        date: new Date().toISOString(),
    };

    mockSales.push(newSale);
    return newSale;
};