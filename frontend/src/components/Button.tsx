import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    className?: string;
}

export default function Button({ 
    children, 
    className = '', 
    variant = 'primary', 
    ...props 
}: ButtonProps) {
    const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center";
    
    const variants = {
        primary: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-purple-500/20",
        outline: "border border-white/20 text-white hover:bg-white/10 backdrop-blur-sm",
        ghost: "text-gray-300 hover:text-white hover:bg-white/5",
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
}