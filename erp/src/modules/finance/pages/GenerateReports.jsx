import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Calendar,
    Download,
    FileText,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Activity,
    ChevronDown
} from 'lucide-react';
import { mockDataService } from '../../../services/mockDataService';
import { calculateAccountBalance } from '../../../utils/accountingCalculations';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function GenerateReports() {
    const [period, setPeriod] = useState('this_month'); // this_week, this_month, this_year, last_week, last_month, last_year
    const [activeTab, setActiveTab] = useState('preset'); // 'preset' | 'custom'
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    // Fetch data
    const { data: accounts } = useQuery({ queryKey: ['accounts'], queryFn: mockDataService.getAccounts });
    const { data: transactions } = useQuery({ queryKey: ['transactions'], queryFn: mockDataService.getTransactions });

    // Date Filtering Logic
    const getDateRange = () => {
        const now = new Date();
        const start = new Date();
        const end = new Date();

        if (activeTab === 'custom') {
            return {
                start: customStart ? new Date(customStart) : new Date(now.getFullYear(), now.getMonth(), 1), // Default to start of month if empty
                end: customEnd ? new Date(customEnd) : new Date()
            };
        }

        switch (period) {
            case 'this_week':
                start.setDate(now.getDate() - now.getDay());
                end.setDate(start.getDate() + 6);
                break;
            case 'this_month':
                start.setDate(1);
                end.setDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());
                break;
            case 'this_year':
                start.setMonth(0, 1);
                end.setMonth(11, 31);
                break;
            case 'last_week':
                start.setDate(now.getDate() - now.getDay() - 7);
                end.setDate(start.getDate() + 6);
                break;
            case 'last_month':
                start.setMonth(now.getMonth() - 1, 1);
                end.setMonth(now.getMonth(), 0);
                break;
            default:
                break;
        }
        return { start, end };
    };

    const handleQuickSelect = (months) => {
        const end = new Date();
        const start = new Date();
        start.setMonth(end.getMonth() - months);
        setCustomStart(start.toISOString().split('T')[0]);
        setCustomEnd(end.toISOString().split('T')[0]);
    };

    const { start, end } = getDateRange();

    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];
        return transactions.filter(t => {
            const d = new Date(t.date);
            // Normalize dates to remove time part for accurate comparison
            const dTime = d.setHours(0, 0, 0, 0);
            const startTime = new Date(start).setHours(0, 0, 0, 0);
            const endTime = new Date(end).setHours(23, 59, 59, 999);
            return dTime >= startTime && dTime <= endTime;
        });
    }, [transactions, start, end]);

    // Financial calculations
    const stats = useMemo(() => {
        if (!accounts || !filteredTransactions) return { revenue: 0, expenses: 0, net: 0, assets: 0, liabilities: 0, equity: 0, count: 0 };

        const getGroupTotal = (type) => {
            return accounts
                .filter(a => a.type === type)
                .reduce((sum, acc) => {
                    const { balanceAmount, balanceType } = calculateAccountBalance(acc, filteredTransactions);
                    return sum + (balanceType === acc.normalBalance ? balanceAmount : -balanceAmount);
                }, 0);
        };

        const revenue = getGroupTotal('Revenue');
        const expenses = getGroupTotal('Expense'); // Includes COGS
        const net = revenue - expenses;
        const assets = getGroupTotal('Asset');
        const liabilities = getGroupTotal('Liability');
        const equity = getGroupTotal('Equity');

        // Validation check for balanced books
        const isBalanced = Math.abs(assets - (liabilities + equity + net)) < 0.01;

        return {
            revenue,
            expenses,
            net,
            assets,
            liabilities,
            equity,
            count: filteredTransactions.length,
            isBalanced
        };
    }, [accounts, filteredTransactions]);

    // Trial Balance for table
    const trialBalanceData = useMemo(() => {
        if (!accounts) return [];
        return accounts.map(acc => {
            const { balanceAmount, balanceType } = calculateAccountBalance(acc, filteredTransactions);
            return { ...acc, balanceAmount, balanceType };
        }).filter(a => a.balanceAmount > 0);
    }, [accounts, filteredTransactions]);

    const formatCurrency = (val) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const formatDate = (d) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const reportTitle = activeTab === 'custom' ? 'Custom Financial Report' : `${period.replace('_', ' ').toUpperCase()} REPORT`;
        const dateRange = `${formatDate(start)} - ${formatDate(end)}`;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40);
        doc.text("Office Ledger", 14, 20);

        doc.setFontSize(16);
        doc.text(reportTitle, 14, 30);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(dateRange, 14, 36);

        // Summary Stats Box
        doc.setDrawColor(220);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 45, 180, 25, 3, 3, 'FD');

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("REVENUE", 24, 53);
        doc.text("EXPENSES", 74, 53);
        doc.text("NET PROFIT", 124, 53);

        doc.setFontSize(14);
        doc.setTextColor(40);
        doc.setFont("helvetica", "bold");
        doc.text(formatCurrency(stats.revenue), 24, 62);
        doc.text(formatCurrency(stats.expenses), 74, 62);

        // Net Profit Color
        if (stats.net >= 0) doc.setTextColor(22, 163, 74); // Green
        else doc.setTextColor(220, 38, 38); // Red
        doc.text(formatCurrency(stats.net), 124, 62);

        // Reset
        doc.setTextColor(40);
        doc.setFont("helvetica", "normal");

        // Table
        const tableColumn = ["Account", "Type", "Category", "Balance"];
        const tableRows = trialBalanceData.map(acc => [
            acc.name,
            acc.type,
            acc.category || '-',
            `${acc.balanceType === 'Credit' ? '-' : ''}${formatCurrency(acc.balanceAmount)}`
        ]);

        autoTable(doc, {
            startY: 80,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            foot: [['TOTAL', '', '', formatCurrency(stats.net)]],
            footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
        });

        // Footer
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Generated automatically via ERP System", 14, finalY);
        doc.text(`Date: ${new Date().toLocaleString()}`, 14, finalY + 5);

        doc.save(`Financial_Report_${period}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();

        // Summary Sheet
        const summaryData = [
            ['Financial Report', 'Generated on ' + new Date().toLocaleString()],
            ['Period', `${formatDate(start)} - ${formatDate(end)}`],
            [],
            ['Metric', 'Amount'],
            ['Total Revenue', stats.revenue],
            ['Total Expenses', stats.expenses],
            ['Net Profit', stats.net],
            ['Assets', stats.assets],
            ['Liabilities', stats.liabilities],
            ['Equity', stats.equity]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

        // Details Sheet
        const detailsData = trialBalanceData.map(acc => ({
            Account: acc.name,
            Type: acc.type,
            Category: acc.category,
            'Balance Amount': acc.balanceAmount,
            'Dr/Cr': acc.balanceType
        }));
        const wsDetails = XLSX.utils.json_to_sheet(detailsData);
        XLSX.utils.book_append_sheet(wb, wsDetails, "Account Details");

        XLSX.writeFile(wb, `Financial_Report_${period}.xlsx`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Generate Reports</h2>
                    <p className="text-xs text-slate-500">Select a time period and download your financial reports</p>
                </div>

                {/* Quick Report Dropdown */}
                <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors">
                        <FileText className="w-4 h-4" />
                        Quick Report
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl rounded-lg border border-slate-100 hidden group-hover:block z-10 p-1">
                        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 mb-1">Current Period</div>
                        {['This Week', 'This Month', 'This Year'].map(p => (
                            <button
                                key={p}
                                onClick={() => { setPeriod(p.toLowerCase().replace(' ', '_')); setActiveTab('preset'); }}
                                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-md transition-colors"
                            >
                                {p}
                            </button>
                        ))}
                        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 mt-1 mb-1">Previous Period</div>
                        {['Last Week', 'Last Month', 'Last Year'].map(p => (
                            <button
                                key={p}
                                onClick={() => { setPeriod(p.toLowerCase().replace(' ', '_')); setActiveTab('preset'); }}
                                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-md transition-colors"
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Selection Area */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tab Header */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('preset')}
                        className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === 'preset' ? 'text-indigo-600 bg-indigo-50/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Preset Periods
                        {activeTab === 'preset' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('custom')}
                        className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === 'custom' ? 'text-indigo-600 bg-indigo-50/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        Custom Date Range
                        {activeTab === 'custom' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'preset' ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { id: 'this_week', label: 'This Week', sub: 'Current week' },
                                { id: 'this_month', label: 'This Month', sub: 'Current month' },
                                { id: 'this_year', label: 'This Year', sub: 'Year to date' },
                                { id: 'last_week', label: 'Last Week', sub: 'Previous week' },
                            ].map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setPeriod(p.id)}
                                    className={`
                                        flex flex-col items-center justify-center py-4 px-3 rounded-lg border transition-all text-center
                                        ${period === p.id
                                            ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500'
                                            : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200'}
                                    `}
                                >
                                    <span className={`text-xs font-bold ${period === p.id ? 'text-indigo-700' : 'text-slate-700'}`}>{p.label}</span>
                                    <span className="text-[10px] text-slate-400 mt-1">{p.sub}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right duration-300">
                            {/* Quick Select */}
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Select</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: 'Last 3 Months', months: 3 },
                                        { label: 'Last 6 Months', months: 6 },
                                        { label: 'Last 1 Year', months: 12 },
                                        { label: 'Last 2 Years', months: 24 },
                                        { label: 'Last 3 Years', months: 36 },
                                        { label: 'Last 5 Years', months: 60 },
                                    ].map(qs => (
                                        <button
                                            key={qs.label}
                                            onClick={() => handleQuickSelect(qs.months)}
                                            className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded text-xs font-semibold text-slate-600 transition-colors"
                                        >
                                            {qs.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Start Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={customStart}
                                            onChange={(e) => setCustomStart(e.target.value)}
                                            className="w-full h-10 px-3 pl-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">End Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={customEnd}
                                            onChange={(e) => setCustomEnd(e.target.value)}
                                            className="w-full h-10 px-3 pl-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Report Card */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 p-6 flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1 capitalize">
                            {activeTab === 'custom' ? 'Custom Financial Report' : `${period.replace('_', ' ')} Report`}
                        </h3>
                        <p className="text-slate-400 text-xs font-mono">
                            {formatDate(start)} - {formatDate(end)}
                        </p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Books Balanced</span>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Revenue</p>
                            <p className="text-2xl font-black text-emerald-900 tracking-tight">{formatCurrency(stats.revenue)}</p>
                        </div>
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">Expenses</p>
                            <p className="text-2xl font-black text-rose-900 tracking-tight">{formatCurrency(stats.expenses)}</p>
                        </div>
                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Net Profit</p>
                            <p className={`text-2xl font-black tracking-tight ${stats.net >= 0 ? 'text-indigo-900' : 'text-rose-900'}`}>
                                {formatCurrency(stats.net)}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Transactions</p>
                            <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.count}</p>
                        </div>
                    </div>

                    {/* Summary Row */}
                    <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-b border-slate-100 py-6 text-center">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assets</p>
                            <p className="text-lg font-bold text-slate-700">{formatCurrency(stats.assets)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Liabilities</p>
                            <p className="text-lg font-bold text-slate-700">{formatCurrency(stats.liabilities)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Equity</p>
                            <p className="text-lg font-bold text-slate-700">{formatCurrency(stats.equity)}</p>
                        </div>
                    </div>

                    {/* Trial Balance Table Preview */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-4">Trial Balance Summary</h4>
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-bold text-slate-600 uppercase tracking-wider">Account</th>
                                        <th className="text-left py-3 px-4 font-bold text-slate-600 uppercase tracking-wider">Type</th>
                                        <th className="text-right py-3 px-4 font-bold text-slate-600 uppercase tracking-wider">Debit</th>
                                        <th className="text-right py-3 px-4 font-bold text-slate-600 uppercase tracking-wider">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {trialBalanceData.slice(0, 5).map(acc => (
                                        <tr key={acc.id} className="hover:bg-slate-50/50">
                                            <td className="py-2.5 px-4 font-medium text-slate-700">{acc.name}</td>
                                            <td className="py-2.5 px-4">
                                                <span className={`
                                                    px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                                                    ${acc.type === 'Asset' ? 'bg-blue-50 text-blue-600' : ''}
                                                    ${acc.type === 'Liability' ? 'bg-amber-50 text-amber-600' : ''}
                                                    ${acc.type === 'Equity' ? 'bg-purple-50 text-purple-600' : ''}
                                                    ${acc.type === 'Revenue' ? 'bg-emerald-50 text-emerald-600' : ''}
                                                    ${acc.type === 'Expense' ? 'bg-rose-50 text-rose-600' : ''}
                                                `}>
                                                    {acc.type}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                                                {acc.balanceType === 'Debit' ? formatCurrency(acc.balanceAmount) : '-'}
                                            </td>
                                            <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                                                {acc.balanceType === 'Credit' ? formatCurrency(acc.balanceAmount) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {trialBalanceData.length > 5 && (
                                        <tr>
                                            <td colSpan={4} className="py-2 px-4 text-center text-slate-400 italic">
                                                ... {trialBalanceData.length - 5} more accounts ...
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="bg-slate-50 font-bold border-t border-slate-200">
                                        <td className="py-3 px-4 text-slate-900">Total</td>
                                        <td></td>
                                        <td className="py-3 px-4 text-right text-slate-900">
                                            {formatCurrency(trialBalanceData.reduce((s, a) => s + (a.balanceType === 'Debit' ? a.balanceAmount : 0), 0))}
                                        </td>
                                        <td className="py-3 px-4 text-right text-slate-900">
                                            {formatCurrency(trialBalanceData.reduce((s, a) => s + (a.balanceType === 'Credit' ? a.balanceAmount : 0), 0))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleDownloadPDF}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors shadow-sm active:scale-[0.98]"
                    >
                        <FileText className="w-5 h-5" />
                        Download PDF Report
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm active:scale-[0.98]"
                    >
                        <Download className="w-5 h-5" />
                        Export to Excel
                    </button>
                </div>
            </div>

            {/* Footer Note */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-3">
                <div className="mt-0.5">
                    <Activity className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                    <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-1">Report Contents & Automatic Reports</h5>
                    <p className="text-[11px] text-indigo-700/80 leading-relaxed">
                        Each report includes: Executive Summary, Trial Balance, Income Statement, Balance Sheet, and Transaction Details.
                        <br />
                        <span className="font-bold">Auto Popups:</span> Weekly reports appear every Sunday, Monthly on the 1st, and Yearly on January 1st.
                    </p>
                </div>
            </div>
        </div>
    );
}
