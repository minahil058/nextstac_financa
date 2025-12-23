
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Search,
    Filter,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar';

export default function LeaveManagement() {
    const { data: leaves, isLoading } = useQuery({
        queryKey: ['leaves-all'],
        queryFn: mockDataService.getAllLeaves,
    });

    const queryClient = useQueryClient();
    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => {
            return new Promise(resolve => {
                setTimeout(() => resolve(mockDataService.updateLeaveStatus(id, status)), 300);
            });
        },
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries(['leaves-all']);
            const previousLeaves = queryClient.getQueryData(['leaves-all']);

            queryClient.setQueryData(['leaves-all'], (old) => {
                return old.map(leave =>
                    leave.id === id ? { ...leave, status } : leave
                );
            });

            return { previousLeaves };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['leaves-all'], context.previousLeaves);
        },
        onSettled: () => {
            queryClient.invalidateQueries(['leaves-all']);
            queryClient.invalidateQueries(['leave-requests']);
            queryClient.invalidateQueries(['employee-leaves']);
        }
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    const handleAction = (id, status) => {
        updateStatusMutation.mutate({ id, status });
    };

    const handleExport = () => {
        if (!leaves || leaves.length === 0) return;

        const headers = ['Employee', 'Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status', 'Requested On'];
        const csvContent = [
            headers.join(','),
            ...filteredLeaves.map(leave => [
                `"${leave.employeeName}"`,
                leave.type,
                leave.startDate.split('T')[0],
                leave.endDate.split('T')[0],
                leave.days,
                `"${leave.reason}"`,
                leave.status,
                leave.requestedOn.split('T')[0]
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `leave_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredLeaves = leaves?.filter(leave => {
        const matchesSearch = leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;
        const matchesType = typeFilter === 'All' || leave.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    if (isLoading) return <div className="p-8 text-center animate-pulse text-slate-500">Loading leave requests...</div>;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
            case 'Rejected':
                return <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
            case 'Pending':
                return <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold"><Clock className="w-3.5 h-3.5" /> Pending</span>;
            default: return null;
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Leave Management</h2>
                        <p className="text-slate-500 mt-1">Review, approve, or reject employee leave requests.</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="w-full sm:w-auto px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg flex items-center justify-center gap-2 font-medium transition-all shadow-sm active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by employee name..."
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg min-w-[150px]">
                            <Filter className="w-4 h-4 text-slate-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm text-slate-700 w-full cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg min-w-[150px]">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm text-slate-700 w-full cursor-pointer"
                            >
                                <option value="All">All Types</option>
                                <option value="Sick Leave">Sick Leave</option>
                                <option value="Vacation">Vacation</option>
                                <option value="Personal">Personal</option>
                                <option value="Emergency">Emergency</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Employee</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Type</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Duration</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Reason</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLeaves?.length > 0 ? (
                                    filteredLeaves.map((request) => (
                                        <tr key={request.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-slate-100 shadow-sm">
                                                        <AvatarImage src={request.avatar} />
                                                        <AvatarFallback className="bg-indigo-50 text-indigo-600">{request.employeeName[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-slate-900">{request.employeeName}</div>
                                                        <div className="text-xs text-slate-500">{request.position || 'Employee'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                    {request.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-900 font-medium">{request.days} Days</div>
                                                <div className="text-xs text-slate-500">
                                                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-slate-600 max-w-[200px] truncate" title={request.reason}>
                                                    {request.reason}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(request.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {(request.status === 'Pending' || request.status === 'Rejected') && (
                                                        <button
                                                            onClick={() => handleAction(request.id, 'Approved')}
                                                            className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {(request.status === 'Pending' || request.status === 'Approved') && (
                                                        <button
                                                            onClick={() => handleAction(request.id, 'Rejected')}
                                                            className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {(request.status === 'Approved' || request.status === 'Rejected') && (
                                                        <button
                                                            onClick={() => handleAction(request.id, 'Pending')}
                                                            className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                                            title="Mark as Pending"
                                                        >
                                                            <Clock className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            No leave requests found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {filteredLeaves?.length > 0 ? (
                        filteredLeaves.map((request) => (
                            <div key={request.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-slate-100">
                                            <AvatarImage src={request.avatar} />
                                            <AvatarFallback>{request.employeeName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold text-slate-900">{request.employeeName}</div>
                                            <div className="text-xs text-slate-500">{request.position || 'Employee'}</div>
                                        </div>
                                    </div>
                                    {getStatusBadge(request.status)}
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-slate-100 text-sm">
                                    <div>
                                        <span className="block text-xs text-slate-500 uppercase font-semibold mb-1">Type</span>
                                        <span className="font-medium text-slate-700">{request.type}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-500 uppercase font-semibold mb-1">Duration</span>
                                        <span className="font-medium text-slate-700">{request.days} Days</span>
                                        <div className="text-xs text-slate-400 mt-0.5">
                                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <span className="block text-xs text-slate-500 uppercase font-semibold mb-1">Reason</span>
                                    <p className="text-sm text-slate-600 line-clamp-2">{request.reason}</p>
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-slate-100 mt-3 pt-3">
                                    {(request.status === 'Pending' || request.status === 'Rejected') && (
                                        <button
                                            onClick={() => handleAction(request.id, 'Approved')}
                                            className="flex-1 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                    )}
                                    {(request.status === 'Pending' || request.status === 'Approved') && (
                                        <button
                                            onClick={() => handleAction(request.id, 'Rejected')}
                                            className="flex-1 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                    )}
                                    {(request.status === 'Approved' || request.status === 'Rejected') && (
                                        <button
                                            onClick={() => handleAction(request.id, 'Pending')}
                                            className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                                            title="Mark as Pending"
                                        >
                                            <Clock className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                            No leave requests found matching your filters.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
