import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import InvoiceForm from '../components/invoices/InvoiceForm';
import {
    FileText,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle,
    AlertCircle,
    Trash2
} from 'lucide-react';
import { clsx } from 'clsx';
import ConfirmationModal from '../../../components/ConfirmationModal';
import InvoiceStatusSelect from '../components/invoices/InvoiceStatusSelect';


export default function InvoiceList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

    const queryClient = useQueryClient();

    const { data: invoices, isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: mockDataService.getInvoices,
    });

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: mockDataService.getProducts,
    });

    const deleteInvoiceMutation = useMutation({
        mutationFn: (id) => new Promise(resolve => setTimeout(() => resolve(mockDataService.deleteInvoice(id)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            setDeleteModal({ isOpen: false, id: null });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => new Promise(resolve => setTimeout(() => resolve(mockDataService.updateInvoiceStatus(id, status)), 300)),
        onSuccess: () => queryClient.invalidateQueries(['invoices'])
    });

    const addInvoiceMutation = useMutation({
        mutationFn: (data) => new Promise(resolve => setTimeout(() => resolve(mockDataService.addInvoice(data)), 300)),
        onSuccess: () => {
            queryClient.invalidateQueries(['invoices']);
            setShowForm(false);
        }
    });

    const filteredInvoices = invoices?.filter(inv => {
        const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });



    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading invoices...</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            {showForm && (
                <InvoiceForm
                    onSave={(data) => addInvoiceMutation.mutate(data)}
                    onCancel={() => setShowForm(false)}
                    products={products || []}
                />
            )}

            <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Invoices</h2>
                        <p className="text-slate-500 text-sm">Manage customer invoices and billing</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-2 font-bold transition-all shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                        <Plus className="w-4 h-4" />
                        New Invoice
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl border-2 border-slate-900 shadow-sm flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
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
                                    {['All', 'Paid', 'Pending', 'Overdue'].map((status) => (
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
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase">Invoice #</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase">Customer</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase">Date Issued</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase text-right">Amount</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase">Status</th>
                                    <th className="px-6 py-4 font-bold text-slate-900 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredInvoices?.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-indigo-600 border-r border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-slate-400" />
                                                {invoice.invoiceNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{invoice.customer}</td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">
                                            {new Date(invoice.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-slate-900 text-right text-lg">
                                            ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <InvoiceStatusSelect
                                                currentStatus={invoice.status}
                                                onUpdate={(newStatus) => updateStatusMutation.mutate({
                                                    id: invoice.id,
                                                    status: newStatus
                                                })}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setDeleteModal({ isOpen: true, id: invoice.id })}
                                                    className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Invoice"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {filteredInvoices?.map((invoice) => (
                        <div key={invoice.id} className="bg-white p-5 rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                                        {invoice.invoiceNumber}
                                    </div>
                                    <div className="font-extrabold text-slate-900 text-lg">{invoice.customer}</div>
                                </div>
                                <InvoiceStatusSelect
                                    currentStatus={invoice.status}
                                    onUpdate={(newStatus) => updateStatusMutation.mutate({
                                        id: invoice.id,
                                        status: newStatus
                                    })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm border-y-2 border-slate-100 py-4">
                                <div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date Issued</div>
                                    <div className="font-bold text-slate-700">
                                        {new Date(invoice.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount</div>
                                    <div className="font-mono font-bold text-slate-900 text-xl">
                                        ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-1">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, id: invoice.id })}
                                    className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    <span className="text-sm font-bold">Delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={() => deleteInvoiceMutation.mutate(deleteModal.id)}
                title="Delete Invoice?"
                message="Are you sure you want to delete this invoice? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
            />
        </div >
    );
}
