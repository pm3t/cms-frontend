import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, ...props }, ref) => {
        return (
            <div className="w-full flex flex-col gap-1.5 object-top">
                {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
                <div className="relative">
                    <input
                        ref={ref}
                        className={`w-full bg-white/50 backdrop-blur-sm border px-4 py-2.5 rounded-lg text-gray-900 transition-all duration-200 outline-none
            ${error
                                ? 'border-red-500 focus:ring-2 focus:ring-red-200 text-red-900 placeholder-red-300'
                                : 'border-gray-200 hover:border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20'
                            } ${className}`}
                        {...props}
                    />
                </div>
                {error && <span className="text-xs font-medium text-red-500 truncate">{error}</span>}
            </div>
        );
    }
);
Input.displayName = 'Input';
