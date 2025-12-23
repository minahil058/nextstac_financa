import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Search,
    Filter,
    History,
    Plus,
    Trash2
} from 'lucide-react';
import ConfirmationModal from '../../../components/ConfirmationModal';


import StockAdjustmentModal from '../components/StockAdjustmentModal';

export default function StockMovements() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [movementToDelete, setMovementToDelete] = useState(null);

    // Filters
    const [typeFilter, setTypeFilter] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const types = ['All', 'In', 'Out', 'Adjustment'];

    const { data: movements, isLoading } = useQuery({
        queryKey: ['stock_movements'],
        queryFn: mockDataService.getStockMovements,
    });

    const deleteMovementMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.deleteStockMovement(id)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['stock_movements']);
            setIsDeleteModalOpen(false);
            setMovementToDelete(null);
        }
    });

    const addMovementMutation = useMutation({
        mutationFn: (data) => new Promise(resolve => setTimeout(() => resolve(mockDataService.addStockMovement(data)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['stock_movements']);
            setIsModalOpen(false);
        }
    });

    const handleDeleteClick = (movement) => {
        setMovementToDelete(movement);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (movementToDelete) {
            deleteMovementMutation.mutate(movementToDelete.id);
        }
    };

    const filteredMovements = movements?.filter(m => {
        const matchesSearch = m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.reference.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || m.type === typeFilter;
        return matchesSearch && matchesType;
    });

    if (isLoading) return <div className="p-8 text-center">Loading stock history...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <StockAdjustmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(data) => addMovementMutation.mutate(data)}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Log?"
                message={`Are you sure you want to delete this stock movement log (${movementToDelete?.reference})?`}
                confirmText={deleteMovementMutation.isPending ? "Deleting..." : "Delete Log"}
                variant="danger"
            />

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Stock Movements</h2>
                        <p className="text-slate-500 text-sm">Track inventory logs and transfers</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                        New Adjustment
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by product or reference..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`px-4 py-2 border rounded-lg flex items-center gap-2 font-medium transition-all ${typeFilter !== 'All'
                                ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            {typeFilter === 'All' ? 'Movement Type' : typeFilter}
                        </button>

                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                    {types.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setTypeFilter(type);
                                                setIsFilterOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${typeFilter === type
                                                ? 'bg-indigo-50 text-indigo-700'
                                                : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            {type}
                                            {typeFilter === type && (
                                                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Reference</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Product</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Type</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Quantity</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Warehouse</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredMovements?.map((move) => (
                                    <tr key={move.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(move.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                            {move.reference}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {move.productName}
                                        </td>
                                        <td className="px-6 py-4">
                                            {move.type === 'In' ? (
                                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                                    <ArrowDownLeft className="w-4 h-4" /> In
                                                </span>
                                            ) : move.type === 'Out' ? (
                                                <span className="flex items-center gap-1 text-red-600 font-medium">
                                                    <ArrowUpRight className="w-4 h-4" /> Out
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-amber-600 font-medium">
                                                    <History className="w-4 h-4" /> {move.type}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            {move.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {move.warehouse}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteClick(move)}
                                                className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                                title="Delete Log"
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
