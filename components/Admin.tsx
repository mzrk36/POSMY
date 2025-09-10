import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Card from './common/Card';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon } from './common/Icons';

interface AdminProps {
    users: User[];
    onAddUser: (user: Omit<User, 'id'>) => Promise<void>;
    onUpdateUser: (user: User) => Promise<void>;
    onDeleteUser: (userId: string) => Promise<void>;
}

const UserModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (user: Omit<User, 'id'> | User) => void;
}> = ({ isOpen, onClose, user, onSave }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('cashier');
    const [pin, setPin] = useState('');

    React.useEffect(() => {
        if (isOpen) {
            if (user) {
                setName(user.name);
                setRole(user.role);
                setPin(user.pin);
            } else {
                setName('');
                setRole('cashier');
                setPin('');
            }
        }
    }, [user, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            alert("PIN must be 4 digits.");
            return;
        }
        const userData = { name, role, pin };
        if (user) {
            onSave({ ...userData, id: user.id });
        } else {
            onSave(userData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
                <h2 className="text-2xl font-bold mb-6 text-yellow-400">{user ? 'Edit User' : 'Add New User'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-slate-400 mb-1">User Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded bg-slate-900 border-slate-600 text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-slate-400 mb-1">Role</label>
                        <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full p-2 border rounded bg-slate-900 border-slate-600 text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400">
                            <option value="cashier">Cashier</option>
                            <option value="owner">Owner</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-slate-400 mb-1">4-Digit PIN</label>
                        <input type="password" value={pin} onChange={e => setPin(e.target.value)} maxLength={4} className="w-full p-2 border rounded bg-slate-900 border-slate-600 text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400" required />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition text-white">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-yellow-400 text-slate-900 rounded-lg font-semibold hover:bg-yellow-300 transition">{user ? 'Save Changes' : 'Add User'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Admin: React.FC<AdminProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleAddClick = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };
    
    const handleDeleteClick = (userId: string) => {
        if(window.confirm("Are you sure you want to delete this user?")) {
            onDeleteUser(userId);
        }
    }

    const handleSave = async (userData: Omit<User, 'id'> | User) => {
        if ('id' in userData) {
            await onUpdateUser(userData as User);
        } else {
            await onAddUser(userData as Omit<User, 'id'>);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <UserGroupIcon className="w-8 h-8 text-yellow-400" />
                    <h1 className="text-3xl font-bold text-slate-300">Admin Panel</h1>
                </div>
                <button onClick={handleAddClick} className="flex items-center gap-2 bg-yellow-400 text-slate-900 px-4 py-2 rounded-lg shadow-lg shadow-yellow-400/20 hover:bg-yellow-300 transition hover:scale-105 transform">
                    <PlusIcon className="w-5 h-5" />
                    Add User
                </button>
            </div>
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="p-4 text-yellow-400">Name</th>
                                <th className="p-4 text-yellow-400">Role</th>
                                <th className="p-4 text-yellow-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="p-4">
                                        <span className="font-medium text-white">{user.name}</span>
                                    </td>
                                    <td className="p-4 text-slate-400 capitalize">{user.role}</td>
                                    <td className="p-4">
                                        <div className="flex gap-4">
                                            <button onClick={() => handleEditClick(user)} className="text-yellow-400 hover:underline flex items-center gap-1">
                                                <PencilIcon className="w-4 h-4" /> Edit
                                            </button>
                                            <button onClick={() => handleDeleteClick(user.id)} className="text-rose-500 hover:underline flex items-center gap-1">
                                                <TrashIcon className="w-4 h-4" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <UserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={editingUser}
                onSave={handleSave}
            />
        </div>
    );
};

export default Admin;