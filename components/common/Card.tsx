import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div 
      className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className || ''}`} 
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;