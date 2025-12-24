import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Store,
    Plus,
    Search,
    MoreVertical,
    Phone,
    MapPin,
    Star,
    Trash2
} from 'lucide-react';
import VendorModal from '../components/VendorModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import StatusToggle from '../components/StatusToggle';

export default function VendorList() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [vendorToDelete, setVendorToDelete] = useState(null);

    const { data: vendors, isLoading } = useQuery({
        queryKey: ['vendors'],
        queryFn: mockDataService.getVendors,
    });

    const addVendorMutation = useMutation({
        mutationFn: (data) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.addVendor(data));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors']);
            setIsModalOpen(false);
        }
    });

    const updateVendorMutation = useMutation({
        mutationFn: ({ id, data }) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.updateVendor(id, data));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors']);
            setIsModalOpen(false);
        }
    });

    // Special mutation for status to avoid closing modal if we were editing (though toggle is inline)
    // Actually reusing updateVendorMutation is fine, but it closes modal?
    // updateVendorMutation has `setIsModalOpen(false)` on success.
    // If I toggle status, I don't want to close any modal (but none is open).
    // However, if I toggle, it invalidates queries.
    // But `setIsModalOpen(false)` might be annoying if I reused it for inline updates?
    // Let's create `updateStatusMutation` specifically for inline updates without side effects like closing modals.

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.updateVendor(id, { status }));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors']);
        }
    });


    const deleteVendorMutation = useMutation({
        mutationFn: (id) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.deleteVendor(id));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors']);
            setIsDeleteModalOpen(false);
            setVendorToDelete(null);
        }
    });

    const handleAddClick = () => {
        setSelectedVendor(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (vendor) => {
        setSelectedVendor(vendor);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (vendor) => {
        setVendorToDelete(vendor);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (vendorToDelete) {
            deleteVendorMutation.mutate(vendorToDelete.id);
        }
    };

    const handleModalSubmit = (data) => {
        if (selectedVendor) {
            updateVendorMutation.mutate({ id: selectedVendor.id, data });
        } else {
            addVendorMutation.mutate(data);
        }
    };

    const filteredVendors = vendors?.filter(vendor =>
        vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center">Loading vendors...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <VendorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                vendor={selectedVendor}
                onSubmit={handleModalSubmit}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Vendor"
                message={`Are you sure you want to delete "${vendorToDelete?.companyName}"?`}
                confirmText={deleteVendorMutation.isPending ? "Deleting..." : "Delete Vendor"}
                variant="danger"
            />

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Vendors</h2>
                        <p className="text-slate-500 text-sm">Manage suppliers and partners</p>
                    </div>
                    <button
                        onClick={handleAddClick}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Vendor
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search vendors..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors?.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No vendors found.
                        </div>
                    ) : filteredVendors?.map((vendor) => (
                        <div key={vendor.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 truncate max-w-[150px]">{vendor.companyName}</h3>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span className="text-xs font-bold text-slate-600">{vendor.rating || 5}.0</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteClick(vendor)}
                                    className="text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                    title="Delete Vendor"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="w-20 text-slate-400">Contact:</span>
                                    <span className="font-medium text-slate-900">{vendor.contactPerson}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="w-20 text-slate-400">Phone:</span>
                                    <span>{vendor.phone}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-slate-600">
                                    <span className="w-20 text-slate-400 shrink-0">Address:</span>
                                    <span className="truncate">{vendor.address}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <StatusToggle
                                    currentStatus={vendor.status || 'Active'}
                                    onUpdate={(newStatus) => updateStatusMutation.mutate({ id: vendor.id, status: newStatus })}
                                    activeValue="Active"
                                    inactiveValue="Inactive"
                                />
                                <button
                                    onClick={() => handleEditClick(vendor)}
                                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                    }
                </div>
            </div>
        </div>
    );
}
