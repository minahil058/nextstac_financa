import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import ProductModal from '../components/ProductModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import ProductStatusToggle from '../components/ProductStatusToggle';
import {
    Package,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpDown,
    AlertTriangle,
    Trash2,
    CheckCircle2,
    LayoutList
} from 'lucide-react';


export default function ProductList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);

    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: mockDataService.getProducts,
    });

    const addProductMutation = useMutation({
        mutationFn: (data) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.addProduct({ ...data, status: 'Active' }));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            setIsModalOpen(false);
        }
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, data }) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.updateProduct(id, data));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            setIsModalOpen(false);
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.updateProduct(id, { status }));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
        }
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(mockDataService.deleteProduct(id));
                }, 300);
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['products']);
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        }
    });

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (productToDelete) {
            deleteProductMutation.mutate(productToDelete.id);
        }
    };

    const handleModalSubmit = (data) => {
        if (selectedProduct) {
            updateProductMutation.mutate({ id: selectedProduct.id, data });
        } else {
            addProductMutation.mutate(data);
        }
    };

    // Derive unique categories from products
    const categories = ['All', ...new Set(products?.map(p => p.category) || [])];
    const statuses = ['All', 'Active', 'Draft', 'Archived', 'Low Stock'];

    const filteredProducts = products?.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;

        let matchesStatus = true;
        const currentStatus = product.status || 'Active';

        if (statusFilter !== 'All') {
            if (statusFilter === 'Low Stock') {
                matchesStatus = product.stock < product.minStock;
            } else {
                matchesStatus = currentStatus === statusFilter;
            }
        }

        return matchesSearch && matchesCategory && matchesStatus;
    });

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading products...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Edit/Add Modal */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                onSubmit={handleModalSubmit}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Product"
                message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
                confirmText={deleteProductMutation.isPending ? "Deleting..." : "Delete Product"}
                variant="danger"
            />

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Products</h2>
                        <p className="text-slate-500 text-sm">Manage inventory items and stock levels</p>
                    </div>
                    <button
                        onClick={handleAddProduct}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                        Add Product
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3">
                        {/* Category Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`px-4 py-2 border rounded-lg flex items-center gap-2 font-medium transition-all ${categoryFilter !== 'All'
                                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                {categoryFilter === 'All' ? 'Category' : categoryFilter}
                            </button>

                            {isFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                            {categories.map((category) => (
                                                <button
                                                    key={category}
                                                    onClick={() => {
                                                        setCategoryFilter(category);
                                                        setIsFilterOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${categoryFilter === category
                                                        ? 'bg-indigo-50 text-indigo-700'
                                                        : 'text-slate-600 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {category}
                                                    {categoryFilter === category && (
                                                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                                className={`px-4 py-2 border rounded-lg flex items-center gap-2 font-medium transition-all ${statusFilter !== 'All'
                                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <LayoutList className="w-4 h-4" />
                                {statusFilter === 'All' ? 'Status' : statusFilter}
                            </button>

                            {isStatusFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsStatusFilterOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                        {statuses.map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    setStatusFilter(status);
                                                    setIsStatusFilterOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${statusFilter === status
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
                </div>

                {/* Table View */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Product Name</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">SKU</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Category</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-right">Price</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-center">Stock</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts?.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                            No products found passing the current filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts?.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <Package className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-medium text-slate-900">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">{product.sku}</td>
                                            <td className="px-6 py-4 text-slate-600">{product.category}</td>
                                            <td className="px-6 py-4 text-slate-900 font-semibold text-right">${product.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-medium ${product.stock < product.minStock ? 'text-red-600' : 'text-slate-700'}`}>
                                                        {product.stock}
                                                    </span>
                                                    {product.stock < product.minStock && (
                                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full mt-1">
                                                            Low Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <ProductStatusToggle
                                                    currentStatus={product.status || 'Active'}
                                                    onUpdate={(newStatus) => updateStatusMutation.mutate({ id: product.id, status: newStatus })}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <button
                                                        onClick={() => handleDeleteClick(product)}
                                                        className="text-slate-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded"
                                                    >
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
