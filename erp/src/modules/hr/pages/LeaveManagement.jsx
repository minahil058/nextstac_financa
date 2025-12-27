

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Search,
    Filter,
    Plus,
    X
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function LeaveManagement() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRequest, setNewRequest] = useState({
        type: 'Sick Leave',
        startDate: '',
        endDate: '',
        reason: ''
    });

    // Fetch Leaves
    const { data: leaves, isLoading } = useQuery({
        queryKey: ['leaves-all'],
        queryFn: async () => {
            const baseUrl = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${baseUrl}/hr/leaves`);
            if (!response.ok) throw new Error('Failed to fetch leaves');
            return response.json();
        },
    });

    // Update Request Status (Admin)
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const baseUrl = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${baseUrl}/hr/leaves/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!response.ok) throw new Error('Failed to update status');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['leaves-all']);
        }
    });

    // Create New Request (Employee)
    const createRequestMutation = useMutation({
        mutationFn: async (requestData) => {
            const baseUrl = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${baseUrl}/hr/leaves`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId: user.id,
                    employeeName: user.name,
                    department: user.department, // Send Department
                    ...requestData
                }),
            });
            if (!response.ok) throw new Error('Failed to create request');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['leaves-all']);
            setIsModalOpen(false);
            setNewRequest({ type: 'Sick Leave', startDate: '', endDate: '', reason: '' }); // Reset form
        }
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    const handleAction = (id, status) => {
        updateStatusMutation.mutate({ id, status });
    };

    const handleSubmitRequest = (e) => {
        e.preventDefault();
        createRequestMutation.mutate(newRequest);
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
        // Implement Search & Filter
        const matchesSearch = leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;
        const matchesType = typeFilter === 'All' || leave.type === typeFilter;

        // Implement Role-Based Access Control
        // 1. Super Admin: Sees EVERYTHING.
        // 2. E-com Admin: Sees ONLY E-commerce department.
        // 3. Dev Admin: Sees ONLY Web Development department.
        // 4. Employee: Sees ONLY their own requests.

        let isAuthorized = false;

        if (user?.role === 'super_admin') {
            isAuthorized = true; // Super Admin sees all
        } else if (user?.role === 'ecommerce_admin') {
            isAuthorized = leave.department === 'E-commerce';
        } else if (user?.role === 'dev_admin') {
            isAuthorized = leave.department === 'Web Development';
        } else {
            // Regular User / Employee
            isAuthorized = leave.employeeId === user?.id;
        }

        return matchesSearch && matchesStatus && matchesType && isAuthorized;
    });

    if (isLoading) return <div className="p-8 text-center animate-pulse text-slate-500">Loading leave requests...</div>;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <Badge variant="success" className="gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Approved</Badge>;
            case 'Rejected':
                return <Badge variant="destructive" className="gap-1.5"><XCircle className="w-3.5 h-3.5" /> Rejected</Badge>;
            case 'Pending':
                return <Badge variant="warning" className="gap-1.5"><Clock className="w-3.5 h-3.5" /> Pending</Badge>;
            default: return null;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Leave Management</h2>
                        <p className="text-slate-500 mt-1">
                            {user?.role === 'user' ? 'Manage and track your leave requests.' : 'Review, approve, or reject employee leave requests.'}
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        {user?.role === 'user' && ( // Only employees see New Request
                            <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                <Plus className="w-4 h-4" />
                                New Request
                            </Button>
                        )}
                        <Button
                            onClick={handleExport}
                            variant="outline"
                            className="w-full sm:w-auto gap-2 shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <Card className="shadow-sm">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <Input
                                type="text"
                                placeholder="Search by employee name..."
                                className="w-full pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
                            <div className="min-w-[150px]">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-slate-500" />
                                            <SelectValue placeholder="All Statuses" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">Status: All</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Approved">Approved</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="min-w-[150px]">
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-full">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            <SelectValue placeholder="Type: All" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">Type: All</SelectItem>
                                        <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                        <SelectItem value="Vacation">Vacation</SelectItem>
                                        <SelectItem value="Personal">Personal</SelectItem>
                                        <SelectItem value="Emergency">Emergency</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-md border bg-white shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="font-semibold text-slate-700">Employee</TableHead>
                                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                                <TableHead className="font-semibold text-slate-700">Duration</TableHead>
                                <TableHead className="font-semibold text-slate-700">Reason</TableHead>
                                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeaves?.length > 0 ? (
                                filteredLeaves.map((request) => (
                                    <TableRow key={request.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                {request.type}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-slate-900 font-medium">{request.days} Days</div>
                                            <div className="text-xs text-slate-500">
                                                {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-slate-600 max-w-[200px] truncate" title={request.reason}>
                                                {request.reason}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(request.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {user?.role !== 'user' && ( // Only Admins can take actions
                                                <div className="flex justify-end gap-2">
                                                    {(request.status === 'Pending' || request.status === 'Rejected') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleAction(request.id, 'Approved')}
                                                            className="h-8 w-8 text-slate-400 hover:text-green-600 hover:bg-green-50"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </Button>
                                                    )}
                                                    {(request.status === 'Pending' || request.status === 'Approved') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleAction(request.id, 'Rejected')}
                                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No leave requests found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {filteredLeaves?.length > 0 ? (
                        filteredLeaves.map((request) => (
                            <Card key={request.id} className="shadow-sm">
                                {/* ... (Mobile card content similar to desktop, adapted) ... */}
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="font-semibold text-slate-900">{request.employeeName}</div>
                                                <div className="text-xs text-slate-500">Employee</div>
                                            </div>
                                        </div>
                                        {getStatusBadge(request.status)}
                                    </div>
                                    {/* ... details ... */}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
                            No leave requests found.
                        </div>
                    )}
                </div>

            </div>

            {/* New Request Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-900">New Leave Request</h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="h-8 w-8 rounded-full">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Leave Type</label>
                                <Select
                                    value={newRequest.type}
                                    onValueChange={(val) => setNewRequest({ ...newRequest, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                        <SelectItem value="Vacation">Vacation</SelectItem>
                                        <SelectItem value="Personal">Personal</SelectItem>
                                        <SelectItem value="Emergency">Emergency</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Start Date</label>
                                    <Input
                                        type="date"
                                        required
                                        value={newRequest.startDate}
                                        onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">End Date</label>
                                    <Input
                                        type="date"
                                        required
                                        value={newRequest.endDate}
                                        onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Reason</label>
                                <textarea
                                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                                    placeholder="Please provide a reason for your leave request..."
                                    required
                                    value={newRequest.reason}
                                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Submit Request</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
