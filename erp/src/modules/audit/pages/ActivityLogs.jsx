import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockDataService } from '../../../services/mockDataService';
import {
    Activity,
    Shield,
    Search,
    Filter,
    Clock,
    User,
    Monitor,
    FilePlus,
    Edit2,
    Trash2,
    LogIn,
    Download,
    FileDown
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export default function ActivityLogs() {
    const { data: logs, isLoading } = useQuery({
        queryKey: ['logs'],
        queryFn: mockDataService.getLogs,
    });

    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('All');

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading activity logs...</div>;

    const filteredLogs = logs?.filter(log => {
        const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
        return matchesSearch && matchesModule;
    });

    const getActionIcon = (action) => {
        if (action.includes('Created')) return <FilePlus className="w-4 h-4" />;
        if (action.includes('Updated')) return <Edit2 className="w-4 h-4" />;
        if (action.includes('Deleted')) return <Trash2 className="w-4 h-4" />;
        if (action.includes('Logged In')) return <LogIn className="w-4 h-4" />;
        if (action.includes('Exported')) return <Download className="w-4 h-4" />;
        return <Activity className="w-4 h-4" />;
    };

    const getActionColor = (action) => {
        if (action.includes('Created')) return 'bg-emerald-100 text-emerald-600 border-emerald-200';
        if (action.includes('Updated')) return 'bg-blue-100 text-blue-600 border-blue-200';
        if (action.includes('Deleted')) return 'bg-rose-100 text-rose-600 border-rose-200';
        if (action.includes('Logged In')) return 'bg-indigo-100 text-indigo-600 border-indigo-200';
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const handleExport = () => {
        if (!filteredLogs || filteredLogs.length === 0) return;

        const headers = ['User', 'Action', 'Module', 'IP Address', 'Timestamp'];
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map(log => [
                `"${log.user}"`,
                `"${log.action}"`,
                `"${log.module}"`,
                `"${log.ip}"`,
                `"${new Date(log.timestamp).toLocaleString()}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        showToast('Activity logs exported successfully', 'success');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Shield className="w-8 h-8 text-indigo-600" />
                            Activity Logs
                        </h1>
                        <p className="text-slate-500 mt-1">Monitor system events and user actions</p>
                    </div>

                    <button
                        onClick={handleExport}
                        className="w-full md:w-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                    >
                        <FileDown className="w-4 h-4" />
                        Export Logs
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by user or action..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <select
                            className="bg-transparent text-sm font-medium text-slate-600 outline-none cursor-pointer"
                            value={moduleFilter}
                            onChange={(e) => setModuleFilter(e.target.value)}
                        >
                            <option value="All">All Modules</option>
                            <option value="Finance">Finance</option>
                            <option value="HR">HR</option>
                            <option value="Inventory">Inventory</option>
                            <option value="Auth">Auth</option>
                        </select>
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative pl-4 sm:pl-8 space-y-8 before:absolute before:left-4 sm:before:left-8 before:top-4 before:bottom-4 before:w-px before:bg-slate-200">
                    {filteredLogs?.map((log) => (
                        <div key={log.id} className="relative pl-8 sm:pl-10 group">
                            {/* Timeline Dot */}
                            <div className={`absolute left-0 sm:left-4 top-1.5 -translate-x-[5px] w-3 h-3 rounded-full border-2 border-white ring-2 ring-slate-100 ${log.action.includes('Deleted') ? 'bg-rose-500' :
                                log.action.includes('Created') ? 'bg-emerald-500' :
                                    log.action.includes('Logged') ? 'bg-indigo-500' : 'bg-blue-500'
                                }`}></div>

                            {/* Card Content */}
                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-0.5">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2.5 rounded-lg border flex-shrink-0 ${getActionColor(log.action)}`}>
                                            {getActionIcon(log.action)}
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-900">{log.user}</span>
                                                <span className="text-slate-400 text-sm">performed</span>
                                                <span className="font-semibold text-indigo-600">{log.action}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                                <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-medium">
                                                    {log.module}
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                    <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:gap-1">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                            <Monitor className="w-3 h-3" />
                                            {log.ip}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredLogs?.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
                            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-slate-900">No logs found</h3>
                            <p className="text-slate-500">Try adjusting your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
