import React, { useState } from 'react';
import {
    X,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Calendar,
    User,
    HeartPulse,
    Clock,
    ShieldAlert
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';

export default function EmployeeDetailModal({ isOpen, onClose, employee }) {
    const [activeTab, setActiveTab] = useState('overview');

    if (!isOpen || !employee) return null;

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'On Leave': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Terminated': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-indigo-500 to-purple-600">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-12 left-8">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                            <AvatarImage src={employee.avatar} alt={employee.firstName} />
                            <AvatarFallback className="text-xl bg-slate-100">{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                {/* Body */}
                <div className="pt-16 pb-6 px-8 flex-1 overflow-y-auto">

                    {/* Basic Info */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{employee.firstName} {employee.lastName}</h2>
                            <p className="text-slate-500 font-medium">{employee.position}</p>
                        </div>
                        <Badge className={`px-3 py-1 text-sm font-semibold border ${getStatusVariant(employee.status)}`}>
                            {employee.status}
                        </Badge>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex gap-6 border-b border-slate-200 mb-6">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'overview' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Overview
                            {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('leave')}
                            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'leave' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Leave Status
                            {activeTab === 'leave' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 animate-in slide-in-from-left-2 duration-300">

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <User className="w-4 h-4 text-indigo-500" /> Professional Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 text-sm">
                                            <Briefcase className="w-4 h-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-slate-500 text-xs">Department</p>
                                                <p className="font-medium text-slate-900">{employee.department}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-slate-500 text-xs">Date of Joining</p>
                                                <p className="font-medium text-slate-900">{new Date(employee.joinDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <div className="w-4 text-center text-slate-400 font-bold">$</div>
                                            <div>
                                                <p className="text-slate-500 text-xs">Salary</p>
                                                <p className="font-medium text-slate-900">${Number(employee.salary).toLocaleString()}/yr</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-indigo-500" /> Contact Info
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 text-sm">
                                            <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-slate-500 text-xs">Email Address</p>
                                                <p className="font-medium text-slate-900">{employee.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-slate-500 text-xs">Phone Number</p>
                                                <p className="font-medium text-slate-900">{employee.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-slate-500 text-xs">Address</p>
                                                <p className="font-medium text-slate-900 text-balance">{employee.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-full border-t border-slate-100 pt-4 mt-2">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
                                        <ShieldAlert className="w-4 h-4 text-red-500" /> Emergency Contact
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <div>
                                            <p className="text-xs text-slate-500">Name</p>
                                            <p className="font-semibold text-slate-900">{employee.emergencyContact?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Relation</p>
                                            <p className="font-semibold text-slate-900">{employee.emergencyContact?.relation || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Phone</p>
                                            <p className="font-semibold text-slate-900">{employee.emergencyContact?.phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'leave' && (
                            <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-5 h-5 text-blue-600" />
                                            <span className="font-semibold text-blue-900">Casual Leave</span>
                                        </div>
                                        <p className="text-3xl font-bold text-blue-700">{employee.leaveBalance?.casual || 0}</p>
                                        <p className="text-xs text-blue-600 mt-1">Days Remaining</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <HeartPulse className="w-5 h-5 text-purple-600" />
                                            <span className="font-semibold text-purple-900">Sick Leave</span>
                                        </div>
                                        <p className="text-3xl font-bold text-purple-700">{employee.leaveBalance?.sick || 0}</p>
                                        <p className="text-xs text-purple-600 mt-1">Days Remaining</p>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-5 h-5 text-amber-600" />
                                            <span className="font-semibold text-amber-900">Annual Leave</span>
                                        </div>
                                        <p className="text-3xl font-bold text-amber-700">{employee.leaveBalance?.annual || 0}</p>
                                        <p className="text-xs text-amber-600 mt-1">Days Remaining</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200">
                                    <p className="text-slate-500 text-sm">Detailed leave history is available in the <span className="font-semibold text-indigo-600">Leave Management</span> module.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
