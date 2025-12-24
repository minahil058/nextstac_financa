import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    ShoppingBag,
    Search,
    Plus,
    MoreHorizontal,
    Calendar,
    Trash2,
    Package
} from 'lucide-react';
import PurchaseOrderModal from '../components/PurchaseOrderModal';
import ConfirmationModal from '../../../components/ConfirmationModal';

export default function PurchaseOrderList() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    const { data: orders, isLoading } = useQuery({
        queryKey: ['purchaseOrders'],
        queryFn: mockDataService.getPurchaseOrders,
    });

    const addMutation = useMutation({
        mutationFn: (data) => new Promise(resolve => setTimeout(() => resolve(mockDataService.addPurchaseOrder(data)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['purchaseOrders']);
            setIsModalOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.deletePurchaseOrder(id)), 300)),
        onSuccess: () => queryClient.invalidateQueries(['purchaseOrders'])
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updatePurchaseOrder(id, { status })), 300)),
        onSuccess: () => queryClient.invalidateQueries(['purchaseOrders'])
    });

    const handleStatusClick = (po) => {
        const statusOrder = ['Draft', 'Ordered', 'Received'];
        const currentIndex = statusOrder.indexOf(po.status);

        if (currentIndex !== -1) {
            const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
            updateStatusMutation.mutate({ id: po.id, status: nextStatus });
        } else if (po.status === 'Cancelled') {
            updateStatusMutation.mutate({ id: po.id, status: 'Draft' });
        }
    };

    const filteredOrders = orders?.filter(o =>
        o.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center">Loading orders...</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Draft': return 'bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer';
            case 'Ordered': return 'bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer';
            case 'Received': return 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer';
            case 'Cancelled': return 'bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setOrderToDelete(null);
                }}
                onConfirm={() => {
                    if (orderToDelete) {
                        deleteMutation.mutate(orderToDelete.id);
                    }
                }}
                title="Delete Purchase Order"
                message={orderToDelete ? `Are you sure you want to delete Purchase Order ${orderToDelete.poNumber}? This action cannot be undone.` : "Are you sure?"}
            />
            <PurchaseOrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(data) => addMutation.mutate(data)}
            />

            <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Purchase Orders</h2>
                        <p className="text-slate-500 text-sm">Track procurement and requisitions</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Create PO
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                    <Search className="absolute left-7 top-6.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {filteredOrders?.map(po => (
                        <div key={po.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{po.poNumber}</h3>
                                        <p className="text-sm text-slate-500">{po.vendor}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleStatusClick(po)}
                                    className={`px-2 py-1 rounded-full text-xs font-bold transition-colors ${getStatusColor(po.status)}`}
                                >
                                    {po.status}
                                </button>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Order Date:</span>
                                    <span className="text-slate-900">{new Date(po.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Expected:</span>
                                    <span className="text-slate-900">{new Date(po.expectedDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                                    <span className="font-medium text-slate-700">Total Amount:</span>
                                    <span className="font-bold text-slate-900">${po.amount.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setOrderToDelete(po);
                                    setIsDeleteModalOpen(true);
                                }}
                                className="w-full py-2 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Trash2 className="w-4 h-4" /> Delete Order
                            </button>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700">PO Number</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Vendor</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Expected</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-right">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders?.map(po => (
                                    <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium text-indigo-600">{po.poNumber}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{po.vendor}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(po.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(po.expectedDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900">${po.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleStatusClick(po)}
                                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-sm ${getStatusColor(po.status)}`}
                                                title="Click to update status"
                                            >
                                                {po.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setOrderToDelete(po);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="text-slate-400 hover:text-red-600 transition-colors"
                                                title="Delete PO"
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
        </div>
    );
}
