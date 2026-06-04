import React from 'react';

export interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
  fullWidth = false,
  type = 'button',
  title
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variants = {
    primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20",
    secondary: "bg-slate-800 hover:bg-slate-900 text-white",
    outline: "border-2 border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-500",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  const disabledStyles = "opacity-50 cursor-not-allowed grayscale";
  
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? disabledStyles : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export interface BadgeProps {
  children?: React.ReactNode;
  color?: 'blue' | 'green' | 'pink' | 'purple' | 'slate' | 'brand';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'blue', className = '' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    pink: 'bg-pink-100 text-pink-800',
    purple: 'bg-purple-100 text-purple-800',
    slate: 'bg-slate-100 text-slate-700',
    brand: 'bg-brand-100 text-brand-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

export interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

// --- New Form Components ---

export const Input = ({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input 
      className={`w-full px-3 py-2 bg-white text-slate-900 border ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'} rounded-lg focus:ring-2 outline-none transition-all placeholder:text-slate-400`}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const TextArea = ({ label, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string, error?: string }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <textarea 
      className={`w-full px-3 py-2 bg-white text-slate-900 border ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'} rounded-lg focus:ring-2 outline-none transition-all placeholder:text-slate-400`}
      rows={4}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const Select = ({ label, options, error, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string, options: string[], error?: string }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <select 
      className={`w-full px-3 py-2 bg-white text-slate-900 border ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-brand-500 focus:border-brand-500'} rounded-lg focus:ring-2 outline-none transition-all`}
      {...props}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);