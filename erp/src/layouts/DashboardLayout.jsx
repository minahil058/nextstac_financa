import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from '../components/ui/animations';
import {
    LayoutDashboard,
    Building2,
    Users,
    Calculator,
    Package,
    ShoppingCart,
    Truck,
    FolderOpen,
    Menu,
    X,
    LogOut,
    Bell,
    Shield
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    {
        label: 'Admin Management',
        path: '/admin/users',
        icon: Shield,
        roles: ['super_admin']
    },
    {
        label: 'Company',
        path: '/company',
        icon: Building2,
        roles: ['super_admin'],
        children: [
            { label: 'Profile', path: '/company/profile' },
            { label: 'Departments', path: '/company/departments' },
            { label: 'Branches', path: '/company/branches' },
        ]
    },
    {
        label: 'HR & Employees',
        path: '/hr',
        icon: Users,
        roles: ['super_admin', 'ecommerce_admin', 'dev_admin'],
        children: [
            { label: 'Employees', path: '/hr/employees' },
            { label: 'Attendance', path: '/hr/attendance' },
            { label: 'Payroll', path: '/hr/payroll' },
            { label: 'Leave Requests', path: '/hr/leave' },
        ]
    },
    {
        label: 'Finance',
        path: '/finance',
        icon: Calculator,
        roles: ['super_admin', 'ecommerce_admin'],
        children: [
            { label: 'Overview', path: '/finance' },
            { label: 'Journal', path: '/finance/journal' },
            { label: 'Ledger', path: '/finance/ledger' },
            { label: 'Invoices', path: '/finance/invoices' },
            { label: 'Payments', path: '/finance/payments' },
            { label: 'Reports', path: '/finance/reports' },
            { label: 'Generate Reports', path: '/finance/generate-reports' },
        ]
    },
    {
        label: 'Inventory',
        path: '/inventory',
        icon: Package,
        roles: ['super_admin', 'ecommerce_admin'],
        children: [
            { label: 'Overview', path: '/inventory' },
            { label: 'Products', path: '/inventory/products' },
            { label: 'Stock Movements', path: '/inventory/stock' },
            { label: 'Warehouses', path: '/inventory/warehouses' },
            { label: 'Vendors', path: '/inventory/vendors' },
        ]
    },
    {
        label: 'Sales & CRM',
        path: '/sales',
        icon: ShoppingCart,
        roles: ['super_admin', 'ecommerce_admin'],
        children: [
            { label: 'Overview', path: '/sales' },
            { label: 'Customers', path: '/sales/customers' },
            { label: 'Orders', path: '/sales/orders' },
            { label: 'Leads', path: '/sales/leads' },
        ]
    },
    {
        label: 'Purchasing',
        path: '/purchasing',
        icon: Truck,
        roles: ['super_admin', 'ecommerce_admin'],
        children: [
            { label: 'Overview', path: '/purchasing' },
            { label: 'Suppliers', path: '/purchasing/suppliers' },
            { label: 'Orders', path: '/purchasing/orders' },
            { label: 'Bills', path: '/purchasing/bills' },
            { label: 'Contracts', path: '/purchasing/contracts' },
        ]
    },
    { label: 'Documents', path: '/documents', icon: FolderOpen, roles: ['super_admin', 'dev_admin'] },
    { label: 'Audit Logs', path: '/audit', icon: Menu, roles: ['super_admin', 'dev_admin'] },
];

export default function DashboardLayout() {
    const { logout, user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const currentOutlet = useOutlet();

    const getDashboardPath = () => {
        switch (user?.role) {
            case 'ecommerce_admin': return '/ecommerce';
            case 'dev_admin': return '/dev';
            default: return '/';
        }
    };

    // Filter and Transform items based on role
    const filteredNavItems = NAV_ITEMS.map(item => {
        if (item.label === 'Dashboard') {
            return { ...item, path: getDashboardPath() };
        }
        return item;
    }).filter(item => {
        if (!item.roles) return true; // Accessible by all
        return item.roles.includes(user?.role);
    });

    const getDashboardTitle = () => {
        switch (user?.role) {
            case 'super_admin': return 'Super Admin Console';
            case 'ecommerce_admin': return 'E-commerce Admin';
            case 'dev_admin': return 'Developer Console';
            default: return 'Office Ledger';
        }
    };

    const renderNavItem = (item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

        return (
            <div key={item.path}>
                <NavLink
                    to={item.path}
                    end={!item.children}
                    className={({ isActive: linkActive }) => cn(
                        "flex items-center gap-3 px-3 py-1.5 rounded-md text-xs font-medium transition-all justify-between group active:scale-95",
                        linkActive
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                >
                    <div className="flex items-center gap-3">
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{item.label}</span>
                    </div>
                </NavLink>

                {/* Sub-menu Removed for Flat Navigation */}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-900">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-30 transition-all">
                <div className="p-4 border-b border-slate-700/50 h-14 flex items-center bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg shadow-lg shadow-indigo-500/30 flex items-center justify-center font-bold text-white text-sm">L</div>
                        <span className="text-sm font-bold truncate text-slate-100 tracking-tight">{getDashboardTitle()}</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 custom-scrollbar">
                    {filteredNavItems.map(renderNavItem)}
                </nav>

                <div className="p-3 border-t border-slate-800">
                    <div className="mb-2 px-2">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Logged in as</p>
                        <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-2 py-1.5 text-slate-400 hover:text-white transition-colors w-full text-xs font-medium rounded hover:bg-slate-800"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300 bg-slate-50/50">

                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between shadow-sm transition-all">
                    <button
                        className="md:hidden p-1.5 -ml-1 text-slate-600 hover:bg-slate-100 rounded-md"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3 ml-auto">
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 ml-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 p-[2px]">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-indigo-700 font-bold text-xs">
                                    AD
                                </div>
                            </div>
                            <div className="hidden sm:block leading-tight">
                                <p className="font-semibold text-slate-700 text-sm">Admin User</p>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Administrator</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <div className="fixed inset-0 z-40 md:hidden">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                            <motion.nav
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 text-white p-4 flex flex-col h-full shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">L</div>
                                        <span className="text-lg font-bold">Office Ledger</span>
                                    </div>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-slate-800 rounded active:scale-90 transition-transform">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="space-y-1 flex-1 overflow-y-auto">
                                    {NAV_ITEMS.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.path}>
                                                <NavLink
                                                    to={item.path}
                                                    end={!item.children}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={({ isActive }) => cn(
                                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                                        isActive || (item.children && location.pathname.startsWith(item.path))
                                                            ? "bg-indigo-600 text-white"
                                                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                                                    )}
                                                >
                                                    {Icon && <Icon className="w-5 h-5" />}
                                                    {item.label}
                                                </NavLink>

                                                {item.children && (
                                                    <div className="ml-4 mt-1 space-y-1 pl-4 border-l border-slate-700">
                                                        {item.children.map(child => (
                                                            <NavLink
                                                                key={child.path}
                                                                to={child.path}
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                className={({ isActive }) => cn(
                                                                    "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                                    isActive
                                                                        ? "text-white font-semibold"
                                                                        : "text-slate-400 hover:text-white"
                                                                )}
                                                            >
                                                                {child.label}
                                                            </NavLink>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.nav>
                        </div>
                    )}
                </AnimatePresence>

                {/* Page Content */}
                <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            variants={pageVariants}
                            className="w-full"
                        >
                            {currentOutlet}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
