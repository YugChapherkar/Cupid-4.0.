import React from 'react';
import { Header } from './Header';

export const Layout: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col w-full max-w-[100vw] overflow-x-hidden relative">
      <Header />
      <main className={`flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        {children}
      </main>
    </div>
  );
};
