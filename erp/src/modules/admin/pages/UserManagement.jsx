import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Users,
    Plus,
    Shield,
    AlertTriangle,
    DollarSign
} from 'lucide-react';
import AdminTableRow from '../components/AdminTableRow';

export default function UserManagement() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); // Track editing state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'ecommerce_admin'
    });
    const [error, setError] = useState('');

    // Fetch Admins
    const { data: admins, isLoading: isLoadingAdmins } = useQuery({
        queryKey: ['admins'],
        queryFn: mockDataService.getAdmins,
    });

    // Fetch Base Pool Config
    const { data: config } = useQuery({
        queryKey: ['compensation-config'],
        queryFn: mockDataService.getCompensationConfig,
    });

    const basePool = config?.basePool || 0;

    const addAdminMutation = useMutation({
        mutationFn: (newAdmin) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const result = mockDataService.addAdmin(newAdmin);
                    if (result.success) resolve(result.data);
                    else reject(result.error);
                }, 500);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admins']);
            setIsModalOpen(false);
            setFormData({ name: '', email: '', role: 'ecommerce_admin' });
            setError('');
        },
        onError: (err) => {
            setError(err);
        }
    });

    const updateAdminMutation = useMutation({
        mutationFn: ({ id, updates }) => {
            return new Promise(resolve => {
                mockDataService.updateAdmin(id, updates);
                resolve();
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admins']);
            setIsModalOpen(false); // Close modal on success for edits too
            setEditingId(null);
            setFormData({ name: '', email: '', role: 'ecommerce_admin' });
        }
    });

    const updateConfigMutation = useMutation({
        mutationFn: (updates) => {
            return new Promise(resolve => {
                mockDataService.updateCompensationConfig(updates);
                resolve();
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['compensation-config']);
        }
    });

    const deleteAdminMutation = useMutation({
        mutationFn: (id) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    mockDataService.deleteAdmin(id);
                    resolve();
                }, 500);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admins']);
        }
    });

    const handleUpdateShare = (id, percentage) => {
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
        updateAdminMutation.mutate({ id, updates: { sharePercentage: percentage } });
    };

    const handleUpdateBasePool = (amount) => {
        updateConfigMutation.mutate({ basePool: amount });
    };

    const handleToggleStatus = (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        updateAdminMutation.mutate({ id, updates: { status: newStatus } });
    };

    const handleEdit = (admin) => {
        setEditingId(admin.id);
        setFormData({
            name: admin.name,
            email: admin.email,
            role: admin.role
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ name: '', email: '', role: 'ecommerce_admin' });
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            updateAdminMutation.mutate({ id: editingId, updates: formData });
        } else {
            addAdminMutation.mutate(formData);
        }
    };

    if (isLoadingAdmins) return <div className="p-8 text-center">Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Management</h1>
                    <p className="text-slate-500 text-sm">Manage system administrators and their roles</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', email: '', role: 'ecommerce_admin' });
                        setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add New Admin
                </button>
            </div>

            {/* Compensation & Limits Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">E-commerce Admins</p>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {admins?.filter(a => a.role === 'ecommerce_admin').length} / 5
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Dev Admins</p>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {admins?.filter(a => a.role === 'dev_admin').length} / 5
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compensation Base Pool */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-5 rounded-xl text-white shadow-lg lg:col-span-1">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-indigo-300" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-100">Total Base Pool</h3>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold">$</span>
                        <input
                            type="number"
                            value={basePool}
                            onChange={(e) => handleUpdateBasePool(parseFloat(e.target.value) || 0)}
                            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-2xl font-bold text-white outline-none focus:bg-white/20 w-full"
                        />
                    </div>
                    <p className="text-xs text-indigo-300 mt-2">Shared Monthly Allocation</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[900px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Profit Share (%)</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 hidden md:table-cell">Est. Salary</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {admins?.map((admin) => (
                                <AdminTableRow
                                    key={admin.id}
                                    admin={admin}
                                    basePool={basePool}
                                    onUpdateShare={handleUpdateShare}
                                    onToggleStatus={handleToggleStatus}
                                    onDelete={(id) => deleteAdminMutation.mutate(id)}
                                    onEdit={handleEdit}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingId ? 'Edit Admin' : 'Add New Admin'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="ecommerce_admin">E-commerce Admin</option>
                                    <option value="dev_admin">Dev Admin</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addAdminMutation.isPending || updateAdminMutation.isPending}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
                                >
                                    {addAdminMutation.isPending || updateAdminMutation.isPending
                                        ? 'Saving...'
                                        : (editingId ? 'Save Changes' : 'Create Admin')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
