import { Product, Sale, SaleItem, User, UserRole } from '../types';

// --- IN-MEMORY DATABASE ---

let products: Product[] = [
    { id: 'prod_1', name: 'Classic Burger', price: 8.99, stock: 50 },
    { id: 'prod_2', name: 'Cheese Burger', price: 9.99, stock: 40 },
    { id: 'prod_3', name: 'Bacon Burger', price: 10.99, stock: 30 },
    { id: 'prod_4', name: 'Fries', price: 3.49, stock: 100 },
    { id: 'prod_5', name: 'Coke', price: 1.99, stock: 80 },
    { id: 'prod_6', name: 'Sprite', price: 1.99, stock: 75 },
    { id: 'prod_7', name: 'Onion Rings', price: 4.99, stock: 45 },
    { id: 'prod_8', name: 'Milkshake', price: 5.49, stock: 25 },
];
let sales: Sale[] = [];
let users: User[] = [];

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- USER MANAGEMENT ---

export const getUsers = async (): Promise<User[]> => {
    await simulateDelay(50);
    return [...users];
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
    await simulateDelay(50);
    const newUser: User = { ...user, id: `user_${crypto.randomUUID()}` };
    users.push(newUser);
    return newUser;
};

export const updateUser = async (user: User): Promise<User> => {
    await simulateDelay(50);
    users = users.map(u => u.id === user.id ? user : u);
    return user;
};

export const deleteUser = async (userId: string): Promise<void> => {
    await simulateDelay(50);
    users = users.filter(u => u.id !== userId);
};

export const loginUser = async (pin: string): Promise<User | null> => {
    await simulateDelay(100);
    const user = users.find(u => u.pin === pin);
    return user ? {...user} : null;
}

// --- PRODUCT MANAGEMENT ---
export const getProducts = async (): Promise<Product[]> => {
    await simulateDelay(50);
    return [...products].sort((a,b) => a.name.localeCompare(b.name));
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    await simulateDelay(50);
    const newProduct: Product = { ...product, id: `prod_${crypto.randomUUID()}` };
    products.push(newProduct);
    return newProduct;
};

export const updateProduct = async (product: Product): Promise<Product> => {
    await simulateDelay(50);
    products = products.map(p => p.id === product.id ? product : p);
    return product;
};

// --- SALES MANAGEMENT ---
export const getSales = async (): Promise<Sale[]> => {
    await simulateDelay(50);
    return [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addSale = async (saleData: Omit<Sale, 'id' | 'date'>, userId: string): Promise<Sale> => {
    await simulateDelay(150);

    // 1. Decrement stock (transaction simulation)
    for (const item of saleData.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product || product.stock < item.quantity) {
            throw new Error(`Not enough stock for ${item.productName}`);
        }
        product.stock -= item.quantity;
    }
    
    // 2. Create the sale record
    const newSale: Sale = {
        ...saleData,
        id: `sale_${crypto.randomUUID()}`,
        date: new Date().toISOString(),
    };

    sales.push(newSale);
    
    return newSale;
};