import React, { useState } from 'react';

interface LoginScreenProps {
    onLogin: (pin: string) => Promise<boolean>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleKeyPress = (key: string) => {
        if (pin.length < 4) {
            setPin(pin + key);
        }
    };
    
    const handleDelete = () => {
        setPin(pin.slice(0, -1));
    };
    
    const handleClear = () => {
        setPin('');
    };

    const handleSubmit = async () => {
        if (pin.length !== 4) {
            setError('PIN must be 4 digits.');
            return;
        }
        setError('');
        setIsLoggingIn(true);
        const success = await onLogin(pin);
        if (!success) {
            setError('Invalid PIN. Please try again.');
            setPin('');
        }
        setIsLoggingIn(false);
    };
    
    const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'];

    return (
        <div className="bg-slate-900 min-h-screen flex flex-col justify-center items-center">
             <h1 className="text-5xl font-bold text-yellow-400 mb-4" style={{textShadow: '0 0 10px #facc15'}}>Astra POS</h1>
             <p className="text-slate-400 mb-8">Please enter your PIN to continue</p>
            <div className="w-full max-w-xs bg-slate-800 border border-slate-700 rounded-lg p-8 shadow-2xl">
                <div className="bg-slate-900 rounded-md h-16 mb-6 flex items-center justify-center text-4xl tracking-[1rem] text-yellow-400">
                    {'*'.repeat(pin.length).padEnd(4, ' ')}
                </div>
                 {error && <p className="text-rose-400 text-center text-sm mb-4 animate-shake">{error}</p>}
                <div className="grid grid-cols-3 gap-4">
                    {keypadKeys.map(key => {
                        const isAction = key === 'C' || key === '⌫';
                        let action = () => handleKeyPress(key);
                        if(key === 'C') action = handleClear;
                        if(key === '⌫') action = handleDelete;
                        
                        return (
                            <button 
                                key={key}
                                onClick={action}
                                className={`h-16 rounded-lg text-2xl font-bold transition-all transform active:scale-95
                                    ${isAction ? 'bg-slate-600 hover:bg-slate-500 text-yellow-400' 
                                               : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
                            >
                                {key}
                            </button>
                        )
                    })}
                </div>
                <button 
                    onClick={handleSubmit} 
                    disabled={isLoggingIn || pin.length !== 4}
                    className="w-full mt-6 h-16 bg-green-500 text-white rounded-lg font-bold text-xl hover:bg-green-400 disabled:bg-slate-600 disabled:cursor-not-allowed transition shadow-lg shadow-green-500/20"
                >
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
            </div>
        </div>
    );
};

export default LoginScreen;