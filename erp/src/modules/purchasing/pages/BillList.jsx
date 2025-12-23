import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Receipt,
    Search,
    MoreHorizontal,
    AlertCircle,
    CheckCircle,
    Clock,
    Plus,
    Trash2,
    Briefcase
} from 'lucide-react';
import BillModal from '../components/BillModal';
import ConfirmationModal from '../../../components/ConfirmationModal';

export default function BillList() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [billToDelete, setBillToDelete] = useState(null);

    const { data: bills, isLoading } = useQuery({
        queryKey: ['bills'],
        queryFn: mockDataService.getBills,
    });

    const addMutation = useMutation({
        mutationFn: (data) => new Promise(resolve => setTimeout(() => resolve(mockDataService.addBill(data)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['bills']);
            setIsModalOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.deleteBill(id)), 300)),
        onSuccess: () => queryClient.invalidateQueries(['bills'])
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updateBill(id, { status })), 300)),
        onSuccess: () => queryClient.invalidateQueries(['bills'])
    });

    const handleStatusClick = (bill) => {
        const statusOrder = ['Pending', 'Paid', 'Overdue'];
        const currentIndex = statusOrder.indexOf(bill.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        updateStatusMutation.mutate({ id: bill.id, status: nextStatus });
    };



    const filteredBills = bills?.filter(b =>
        b.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center">Loading bills...</div>;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Paid': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'Overdue': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-amber-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setBillToDelete(null);
                }}
                onConfirm={() => {
                    if (billToDelete) {
                        deleteMutation.mutate(billToDelete.id);
                    }
                }}
                title="Delete Bill"
                message={billToDelete ? `Are you sure you want to delete bill ${billToDelete.billNumber}? This action cannot be undone.` : "Are you sure?"}
            />
            <BillModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(data) => addMutation.mutate(data)}
            />

            <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Bills</h2>
                        <p className="text-slate-500 text-sm">Vendor invoices and payments due</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Record Bill
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                    <Search className="absolute left-7 top-6.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search bills..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {filteredBills?.map(bill => (
                        <div key={bill.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{bill.billNumber}</h3>
                                        <p className="text-sm text-slate-500">{bill.vendor}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleStatusClick(bill)}
                                        className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                        {getStatusIcon(bill.status)}
                                        <span className={`text-xs font-bold ${bill.status === 'Paid' ? 'text-emerald-700' :
                                            bill.status === 'Overdue' ? 'text-red-700' : 'text-amber-700'
                                            }`}>
                                            {bill.status}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Bill Date:</span>
                                    <span className="text-slate-900">{new Date(bill.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Due Date:</span>
                                    <span className={`font-medium ${new Date(bill.dueDate) < new Date() && bill.status !== 'Paid' ? 'text-red-600' : 'text-slate-900'}`}>
                                        {new Date(bill.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                                    <span className="font-medium text-slate-700">Amount Due:</span>
                                    <span className="font-bold text-slate-900">${bill.amount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setBillToDelete(bill);
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="w-full py-2 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Bill #</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Vendor</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Due Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Amount</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredBills?.map(bill => (
                                <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-slate-600">{bill.billNumber}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{bill.vendor}</td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(bill.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(bill.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-900">${bill.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleStatusClick(bill)}
                                            className="flex items-center gap-2 px-3 py-1 rounded-full transition-all hover:bg-slate-100 cursor-pointer"
                                            title="Click to cycle status"
                                        >
                                            {getStatusIcon(bill.status)}
                                            <span className={`text-sm font-medium ${bill.status === 'Paid' ? 'text-emerald-700' :
                                                bill.status === 'Overdue' ? 'text-red-700' : 'text-amber-700'
                                                }`}>
                                                {bill.status}
                                            </span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setBillToDelete(bill);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="text-slate-400 hover:text-red-600 transition-colors"
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
        </div>
    );
}
