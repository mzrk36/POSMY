import React, { useState } from 'react';

interface AdminSetupScreenProps {
    onSetup: (name: string, pin: string) => Promise<void>;
}

const AdminSetupScreen: React.FC<AdminSetupScreenProps> = ({ onSetup }) => {
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isSettingUp, setIsSettingUp] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your name.');
            return;
        }
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
            setError('PIN must be exactly 4 digits.');
            return;
        }
        setError('');
        setIsSettingUp(true);
        await onSetup(name, pin);
        // The parent component will handle transitioning away from this screen
    };

    return (
        <div className="bg-slate-900 min-h-screen flex flex-col justify-center items-center">
            <h1 className="text-5xl font-bold text-yellow-400 mb-4" style={{textShadow: '0 0 10px #facc15'}}>Welcome to Astra POS</h1>
            <p className="text-slate-400 mb-8">Let's set up your admin account.</p>
            <div className="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-slate-400 mb-2">Your Name</label>
                        <input 
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-3 border rounded-lg bg-slate-900 border-slate-600 text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
                            placeholder="e.g., Alex Ryder"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-slate-400 mb-2">Create a 4-Digit PIN</label>
                        <input
                            type="password"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            maxLength={4}
                            className="w-full p-3 border rounded-lg bg-slate-900 border-slate-600 text-white focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400 tracking-[1rem] text-center"
                            placeholder="••••"
                            required
                        />
                    </div>
                    {error && <p className="text-rose-400 text-center text-sm mb-4 animate-shake">{error}</p>}
                    <button 
                        type="submit"
                        disabled={isSettingUp}
                        className="w-full mt-2 h-14 bg-yellow-400 text-slate-900 rounded-lg font-bold text-xl hover:bg-yellow-300 disabled:bg-slate-600 disabled:cursor-not-allowed transition shadow-lg shadow-yellow-400/20"
                    >
                        {isSettingUp ? 'Setting up...' : 'Create Admin Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminSetupScreen;