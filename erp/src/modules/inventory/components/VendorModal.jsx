import React, { useState, useEffect } from 'react';
import { X, Save, Store } from 'lucide-react';

export default function VendorModal({ isOpen, onClose, vendor, onSubmit }) {
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        status: 'Active'
    });

    useEffect(() => {
        if (vendor) {
            setFormData({
                companyName: vendor.companyName || '',
                contactPerson: vendor.contactPerson || '',
                email: vendor.email || '',
                phone: vendor.phone || '',
                address: vendor.address || '',
                status: vendor.status || 'Active'
            });
        } else {
            setFormData({
                companyName: '',
                contactPerson: '',
                email: '',
                phone: '',
                address: '',
                status: 'Active'
            });
        }
    }, [vendor, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Store className="w-5 h-5 text-indigo-600" />
                        {vendor ? 'Edit Vendor' : 'Add New Vendor'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Company Name</label>
                        <input
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                            placeholder="e.g. Acme Supplies"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Contact Person</label>
                            <input
                                type="text"
                                required
                                value={formData.contactPerson}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Phone</label>
                            <input
                                type="text"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="contact@example.com"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Address</label>
                        <textarea
                            rows="2"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="123 Business Rd, City"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {vendor ? 'Save Changes' : 'Create Vendor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
