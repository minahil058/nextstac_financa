import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    CreditCard,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpRight,
    X,
    Check,
    Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmationModal from '../../../components/ConfirmationModal';
import PaymentStatusToggle from '../components/payment/PaymentStatusToggle';


export default function PaymentList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [formData, setFormData] = useState({
        vendor: '',
        amount: '',
        method: 'Bank Transfer'
    });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    const queryClient = useQueryClient();

    const { data: payments, isLoading } = useQuery({
        queryKey: ['payments'],
        queryFn: mockDataService.getPayments,
    });

    const addPaymentMutation = useMutation({
        mutationFn: mockDataService.addPayment,
        onSuccess: () => {
            queryClient.invalidateQueries(['payments']);
            setIsModalOpen(false);
            setFormData({ vendor: '', amount: '', method: 'Bank Transfer' });
        }
    });

    const deletePaymentMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.deletePayment(id)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['payments']);
            setDeleteModal({ isOpen: false, id: null });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updatePaymentStatus(id, status)), 300)),
        onSuccess: () => queryClient.invalidateQueries(['payments'])
    });

    const filteredPayments = payments?.filter(pay => {
        const matchesSearch = pay.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pay.vendor.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || pay.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addPaymentMutation.mutate({
            vendor: formData.vendor,
            amount: parseFloat(formData.amount),
            method: formData.method
        });
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Loading payments...</div>;

    return (
        <div className="min-h-screen bg-slate-50 relative">

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-900 animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 bg-slate-50 border-b-2 border-slate-900 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">Record New Payment</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.vendor}
                                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none font-medium text-slate-900 transition-colors"
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0.01"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none font-bold text-slate-900 text-lg transition-colors"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
                                <select
                                    value={formData.method}
                                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none font-medium text-slate-900 bg-white cursor-pointer"
                                >
                                    <option>Bank Transfer</option>
                                    <option>Credit Card</option>
                                    <option>Cash</option>
                                    <option>Check</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={addPaymentMutation.isPending}
                                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {addPaymentMutation.isPending ? 'Processing...' : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Confirm Payment
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Payments</h2>
                        <p className="text-slate-500 text-sm">Track outgoing payments to vendors</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-2 font-bold transition-all shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <Plus className="w-4 h-4" />
                        Record Payment
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border-2 border-slate-900 shadow-sm flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search payments..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`px-4 py-2 border-2 rounded-lg flex items-center gap-2 font-bold transition-colors ${statusFilter !== 'All'
                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                                : 'border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            {statusFilter === 'All' ? 'Status' : statusFilter}
                        </button>

                        {isFilterOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsFilterOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border-2 border-slate-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                    {['All', 'Paid', 'Pending', 'Failed'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-between ${statusFilter === status
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {status}
                                            {statusFilter === status && (
                                                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-xl border-2 border-slate-900 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100 border-b-2 border-slate-900">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider">Payment #</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider">Vendor</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPayments?.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-indigo-600 border-r border-slate-100">
                                            {payment.paymentNumber}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{payment.vendor}</td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {new Date(payment.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <span className="flex items-center gap-2 font-medium">
                                                <CreditCard className="w-4 h-4 text-slate-400" />
                                                {payment.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 font-bold text-right font-mono text-lg">
                                            ${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <PaymentStatusToggle
                                                currentStatus={payment.status}
                                                onUpdate={(newStatus) => updateStatusMutation.mutate({
                                                    id: payment.id,
                                                    status: newStatus
                                                })}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, id: payment.id })}
                                                className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Payment"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {filteredPayments?.map((payment) => (
                        <div key={payment.id} className="bg-white p-5 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                                        {payment.paymentNumber}
                                    </div>
                                    <div className="font-extrabold text-slate-900 text-lg">{payment.vendor}</div>
                                </div>
                                <PaymentStatusToggle
                                    currentStatus={payment.status}
                                    onUpdate={(newStatus) => updateStatusMutation.mutate({
                                        id: payment.id,
                                        status: newStatus
                                    })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm border-y-2 border-slate-100 py-4">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</div>
                                    <div className="font-bold text-slate-700">
                                        {new Date(payment.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount</div>
                                    <div className="font-mono font-bold text-slate-900 text-xl">
                                        ${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <CreditCard className="w-4 h-4" />
                                    {payment.method}
                                </div>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, id: payment.id })}
                                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={() => deletePaymentMutation.mutate(deleteModal.id)}
                title="Delete Payment?"
                message="Are you sure you want to delete this payment record? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
            />
        </div >
    );
}
