import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    ArrowLeftRight,
    FileText,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    X,
    Check,
    ArrowDownLeft,
    ArrowUpRight,
    TrendingUp,
    Clock,
    CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const Returns = () => {
    const [activeTab, setActiveTab] = useState('credit'); // credit (Sales) or debit (Purchase)
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        entityName: '',
        referenceInvoice: '',
        amount: '',
        reason: 'Damaged Goods'
    });

    const queryClient = useQueryClient();

    const { data: returns, isLoading } = useQuery({
        queryKey: ['returns'],
        queryFn: mockDataService.getReturns,
    });

    const addReturnMutation = useMutation({
        mutationFn: mockDataService.addReturn,
        onSuccess: () => {
            queryClient.invalidateQueries(['returns']);
            setIsModalOpen(false);
            setFormData({ entityName: '', referenceInvoice: '', amount: '', reason: 'Damaged Goods' });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updateReturnStatus(id, status)), 300)),
        onSuccess: () => queryClient.invalidateQueries(['returns'])
    });

    const getNextStatus = (currentStatus) => {
        if (currentStatus === 'Pending') return 'Processed';
        if (currentStatus === 'Processed') return 'Approved';
        return 'Pending';
    };

    // Filter by Tab and Search
    const filteredReturns = returns?.filter(ret => {
        const matchesTab = activeTab === 'credit'
            ? ret.type === 'Credit Note'
            : ret.type === 'Debit Note';
        const matchesSearch =
            ret.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ret.entityName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || ret.status === statusFilter;
        return matchesTab && matchesSearch && matchesStatus;
    });

    // Statistics
    const stats = {
        totalValue: filteredReturns?.reduce((acc, curr) => acc + curr.amount, 0) || 0,
        pendingCount: filteredReturns?.filter(r => r.status === 'Pending').length || 0,
        processedCount: filteredReturns?.filter(r => r.status === 'Processed' || r.status === 'Approved').length || 0
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addReturnMutation.mutate({
            entityName: formData.entityName,
            referenceInvoice: formData.referenceInvoice,
            amount: parseFloat(formData.amount),
            reason: formData.reason,
            type: activeTab === 'credit' ? 'Credit Note' : 'Debit Note'
        });
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Loading returns...</div>;

    return (
        <div className="min-h-screen bg-slate-50 relative">

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-900 animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 bg-slate-50 border-b-2 border-slate-900 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">
                                Create {activeTab === 'credit' ? 'Credit Note' : 'Debit Note'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {activeTab === 'credit' ? 'Customer Name' : 'Vendor Name'}
                                </label>
                                <input
                                    type="text" required value={formData.entityName}
                                    onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none font-medium text-slate-900 transition-colors"
                                    placeholder={activeTab === 'credit' ? 'e.g. John Doe' : 'e.g. Acme Supplier'}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference Invoice #</label>
                                <input
                                    type="text" required value={formData.referenceInvoice}
                                    onChange={(e) => setFormData({ ...formData, referenceInvoice: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none font-medium text-slate-900 transition-colors"
                                    placeholder="e.g. INV-12345"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Refund Amount ($)</label>
                                <input
                                    type="number" required min="0.01" step="0.01" value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-900 text-lg transition-colors"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</label>
                                <select
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none font-medium text-slate-900 bg-white cursor-pointer"
                                >
                                    <option>Damaged Goods</option>
                                    <option>Incorrect Item</option>
                                    <option>Overcharged</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <button
                                type="submit" disabled={addReturnMutation.isPending}
                                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                            >
                                {addReturnMutation.isPending ? 'Processing...' : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Create {activeTab === 'credit' ? 'Credit Note' : 'Debit Note'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Returns Management</h2>
                        <p className="text-slate-500 text-sm">Manage Credit Notes (Sales) and Debit Notes (Purchases)</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-2 font-bold transition-all shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <Plus className="w-4 h-4" />
                        New {activeTab === 'credit' ? 'Credit Note' : 'Debit Note'}
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl border-2 border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Total {activeTab === 'credit' ? 'Credits' : 'Debits'}</p>
                            <h3 className="text-2xl font-black text-slate-900">${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border-2 border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Pending Requests</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.pendingCount}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border-2 border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Processed</p>
                            <h3 className="text-2xl font-black text-slate-900">{stats.processedCount}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                    {['credit', 'debit'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all relative ${activeTab === tab ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="returns-tab-pill"
                                    className="absolute inset-0 bg-slate-900 rounded-lg shadow-sm"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {tab === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                {tab === 'credit' ? 'Credit Note (Sales)' : 'Debit Note (Purchase)'}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="bg-white p-4 rounded-xl border-2 border-slate-900 shadow-sm flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text" placeholder="Search returns..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none transition-all font-medium"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={clsx(
                                "px-4 py-2 border-2 rounded-lg flex items-center gap-2 font-bold transition-colors",
                                statusFilter !== 'All'
                                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900'
                            )}
                        >
                            <Filter className="w-4 h-4" />
                            {statusFilter === 'All' ? 'Status' : statusFilter}
                        </button>

                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border-2 border-slate-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                    {['All', 'Pending', 'Approved', 'Processed', 'Rejected'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setIsFilterOpen(false);
                                            }}
                                            className={clsx(
                                                "w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-between",
                                                statusFilter === status
                                                    ? 'bg-indigo-50 text-indigo-700'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                            )}
                                        >
                                            {status}
                                            {statusFilter === status && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-xl border-2 border-slate-900 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 border-b-2 border-slate-900">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider">Return #</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider">Reference</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider">Entity</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredReturns?.length === 0 ? (
                                    <tr><td colSpan="7" className="p-12 text-center text-slate-500">No records found.</td></tr>
                                ) : (
                                    filteredReturns?.map((ret) => (
                                        <tr key={ret.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-indigo-600 border-r border-slate-100">{ret.returnNumber}</td>
                                            <td className="px-6 py-4 font-medium text-slate-600 bg-slate-50/50">{ret.referenceInvoice}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{ret.entityName}</td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">{new Date(ret.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-slate-500 italic max-w-[150px] truncate">{ret.reason}</td>
                                            <td className="px-6 py-4 font-mono font-bold text-slate-900 text-right text-lg">
                                                ${ret.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => updateStatusMutation.mutate({ id: ret.id, status: getNextStatus(ret.status) })}
                                                    className={clsx(
                                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase border transition-all active:scale-95 cursor-pointer",
                                                        ret.status === 'Approved' || ret.status === 'Processed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200' :
                                                            ret.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200' :
                                                                'bg-slate-100 text-slate-800 border-slate-200'
                                                    )}
                                                    title="Click to cycle status"
                                                >
                                                    {ret.status === 'Approved' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                    {ret.status}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {filteredReturns?.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border-2 border-slate-900">No records found.</div>
                    ) : (
                        filteredReturns?.map((ret) => (
                            <div key={ret.id} className="bg-white p-5 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">{ret.returnNumber}</div>
                                        <div className="font-extrabold text-slate-900 text-lg">{ret.entityName}</div>
                                    </div>
                                    <button
                                        onClick={() => updateStatusMutation.mutate({ id: ret.id, status: getNextStatus(ret.status) })}
                                        className={clsx(
                                            "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold uppercase border transition-all active:scale-95",
                                            ret.status === 'Approved' || ret.status === 'Processed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                ret.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                    'bg-slate-100 text-slate-800 border-slate-200'
                                        )}
                                    >
                                        {ret.status}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm border-y-2 border-slate-100 py-4">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ref Invoice</div>
                                        <div className="font-bold text-slate-700">{ret.referenceInvoice}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount</div>
                                        <div className="font-mono font-bold text-slate-900 text-xl">
                                            ${ret.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs font-medium text-slate-500 italic">
                                    Reason: {ret.reason}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Returns;
