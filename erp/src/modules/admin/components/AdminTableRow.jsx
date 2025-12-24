import React from 'react';
import {
    MoreHorizontal,
    Trash2,
    CheckCircle,
    AlertTriangle,
    Edit
} from 'lucide-react';

export default function AdminTableRow({
    admin,
    basePool,
    onUpdateShare,
    onToggleStatus,
    onDelete,
    onEdit
}) {
    // Helper for Role Badges
    const getRoleBadge = (role) => {
        switch (role) {
            case 'super_admin':
                return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">Super Admin</span>;
            case 'ecommerce_admin':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-200">E-commerce Admin</span>;
            case 'dev_admin':
                return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">Dev Admin</span>;
            default:
                return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">User</span>;
        }
    };

    // Helper for Status Badge
    const getStatusBadge = (status) => {
        const isActive = status === 'Active';
        return (
            <button
                onClick={() => onToggleStatus(admin.id, admin.status)}
                className={`inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all w-24 ${isActive
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    }`}
            >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                {status || 'Active'}
            </button>
        );
    };

    const calculateSalary = () => {
        if (admin.role === 'super_admin') return <span className="text-slate-400 text-xs italic">Excluded</span>;
        const amount = (basePool * (admin.sharePercentage || 0)) / 100;
        return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <tr className="hover:bg-slate-50 transition-colors group border-b border-slate-100 last:border-0">
            {/* Name Column */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shadow-sm shrink-0">
                        {admin.avatar ? (
                            <img src={admin.avatar} alt={admin.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            admin.name.charAt(0)
                        )}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 text-sm">{admin.name}</p>
                        <p className="text-xs text-slate-500">{admin.email}</p>
                    </div>
                </div>
            </td>

            {/* Role Column */}
            <td className="px-6 py-4 whitespace-nowrap">
                {getRoleBadge(admin.role)}
            </td>

            {/* Profit Share Column */}
            <td className="px-6 py-4 whitespace-nowrap">
                {admin.role !== 'super_admin' ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={admin.sharePercentage || 0}
                            onChange={(e) => onUpdateShare(admin.id, parseFloat(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-center"
                        />
                        <span className="text-slate-400 font-medium text-xs">%</span>
                    </div>
                ) : (
                    <span className="text-slate-400 text-xs italic opacity-50">N/A</span>
                )}
            </td>

            {/* Est. Salary Column - Hidden on Mobile */}
            <td className="px-6 py-4 font-mono font-medium text-slate-700 whitespace-nowrap hidden md:table-cell">
                {calculateSalary()}
            </td>

            {/* Status Column */}
            <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(admin.status)}
            </td>

            {/* Actions Column */}
            <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(admin)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    {admin.role !== 'super_admin' && (
                        <button
                            onClick={() => onDelete(admin.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
