import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Calendar,
    Clock,
    Search,
    Filter,
    Download
} from 'lucide-react';



// ... (imports remain)

// ... (imports remain)
import AttendanceModal from '../components/AttendanceModal';

export default function AttendanceLog() {
    const queryClient = useQueryClient();
    const { data: attendance, isLoading } = useQuery({
        queryKey: ['attendance'],
        queryFn: mockDataService.getAttendance,
    });

    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: mockDataService.getEmployees,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const updateAttendanceMutation = useMutation({
        mutationFn: ({ id, updates }) => {
            return new Promise(resolve => {
                if (id) {
                    setTimeout(() => resolve(mockDataService.updateAttendance(id, updates)), 300);
                } else {
                    setTimeout(() => resolve(mockDataService.addAttendance(updates)), 300);
                }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['attendance']);
            setIsModalOpen(false);
        }
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleEditClick = (record) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const handleManualEntry = () => {
        setSelectedRecord(null); // Create mode
        setIsModalOpen(true);
    };

    const handleSave = (id, updates) => {
        updateAttendanceMutation.mutate({ id, updates });
    };

    const filteredAttendance = attendance?.filter(record => {
        const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || record.status === statusFilter;

        let matchesDate = true;
        if (startDate && endDate) {
            matchesDate = record.date >= startDate && record.date <= endDate;
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    const handleExport = () => {
        if (!filteredAttendance || filteredAttendance.length === 0) return;

        const headers = ['Employee Name', 'Date', 'Check In', 'Check Out', 'Status', 'Work Hours'];
        const csvContent = [
            headers.join(','),
            ...filteredAttendance.map(record => [
                `"${record.employeeName}"`,
                record.date,
                `"${record.checkIn}"`,
                `"${record.checkOut}"`,
                record.status,
                `"${record.workHours || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) return <div className="p-8 text-center">Loading attendance records...</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-700 border-green-200';
            case 'Absent': return 'bg-red-100 text-red-700 border-red-200';
            case 'Late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Half Day': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Attendance</h2>
                        <p className="text-slate-500 text-sm mt-1">Track employee check-ins and working hours</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleExport}
                            className="flex-1 sm:flex-none px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 font-medium transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            onClick={handleManualEntry}
                            className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 font-medium shadow-sm transition-colors"
                        >
                            <Clock className="w-4 h-4" />
                            Manual Entry
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 flex-wrap">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search employee..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1">
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-400 font-semibold uppercase">From</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="text-xs border-none outline-none text-slate-600 bg-transparent w-24"
                                />
                            </div>
                            <div className="w-px h-4 bg-slate-200"></div>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-400 font-semibold uppercase">To</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="text-xs border-none outline-none text-slate-600 bg-transparent w-24"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
                            <Filter className="w-4 h-4 text-slate-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent outline-none text-slate-600 text-sm w-24"
                            >
                                <option value="All">All Status</option>
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Late">Late</option>
                                <option value="Half Day">Half Day</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">Employee</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">Date</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">Check In</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">Check Out</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 text-right whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAttendance?.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                            {record.employeeName}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                            {record.date}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-mono whitespace-nowrap">
                                            {record.checkIn}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-mono whitespace-nowrap">
                                            {record.checkOut}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => handleEditClick(record)}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium text-xs bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AttendanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                record={selectedRecord}
                employees={employees}
                onSave={handleSave}
            />
        </div >
    );
}
