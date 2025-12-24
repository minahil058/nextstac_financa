import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, Book, PieChart, LayoutDashboard, ArrowLeftRight } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const FinanceHeader = () => {
    const navItems = [
        { label: 'Invoices', path: '/finance/invoices', icon: FileText },
        { label: 'Payments', path: '/finance/payments', icon: PieChart },
        { label: 'Returns', path: '/finance/returns', icon: ArrowLeftRight },
        { label: 'Journal', path: '/finance/journal', icon: FileText },
        { label: 'Ledger', path: '/finance/ledger', icon: Book },
        { label: 'Reports', path: '/finance/reports', icon: PieChart },
        { label: 'Generate Reports', path: '/finance/generate-reports', icon: FileText },
    ];

    return (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10 font-[Inter]">
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-200">
                            L
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold text-slate-900 leading-tight tracking-tight">
                                Office Ledger
                            </h1>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                Pro Finance
                            </span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>

                    <nav className="hidden sm:flex items-center gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.exact}
                                className={({ isActive }) => clsx(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors relative",
                                    isActive
                                        ? "text-slate-900"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className="relative z-10">{item.label}</span>
                                        {isActive && (
                                            <motion.span
                                                layoutId="finance-nav-pill"
                                                className="absolute inset-0 bg-slate-100 rounded-lg"
                                                initial={false}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <button className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full hover:bg-indigo-100 transition-colors">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Double Entry Active
                    </button>
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                        U
                    </div>
                </div>
            </div>

            {/* Mobile Nav (Scrollable) */}
            <div className="sm:hidden overflow-x-auto pb-3 px-4 flex gap-2 no-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.exact}
                        className={({ isActive }) => clsx(
                            "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                            isActive
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-500 border-slate-200"
                        )}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>
        </div >
    );
};

export default FinanceHeader;
