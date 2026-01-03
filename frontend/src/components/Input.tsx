import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, className = '', ...props }, ref) => {
    const id = useId();
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="inline-block mb-1 pl-1 text-sm text-gray-300">
                    {label}
                </label>
            )}
            <input
                id={id}
                ref={ref}
                className={`w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200 ${className}`}
                {...props}
            />
        </div>
    );
});

export default Input;