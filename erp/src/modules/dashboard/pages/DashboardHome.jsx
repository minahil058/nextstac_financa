import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { containerVariants, cardVariants } from '@/components/ui/animations';
import { mockDataService } from '../../../services/mockDataService';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import {
    DollarSign,
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    TrendingDown,
    Activity,
    Clock,
    AlertCircle,
    Upload
} from 'lucide-react';
import PendingLeaveWidget from '../components/PendingLeaveWidget';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const DashboardHome = () => {
    const navigate = useNavigate();

    // Keep existing queries for real data integration later
    const { data: accounts } = useQuery({
        queryKey: ['accounts'],
        queryFn: mockDataService.getAccounts,
    });

    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    // Fetch real transactions for Finance Data
    const baseUrl = import.meta.env.VITE_API_URL || '/api';

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            try {
                const res = await fetch(`${baseUrl}/finance/transactions`);
                if (!res.ok) return [];
                return res.json();
            } catch (e) {
                console.warn("Failed to fetch transactions:", e);
                return [];
            }
        },
    });

    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            try {
                const res = await fetch(`${baseUrl}/hr/employees`);
                if (!res.ok) return [];
                return res.json();
            } catch (e) { return []; }
        }
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            try {
                const res = await fetch(`${baseUrl}/inventory/products`);
                if (!res.ok) return [];
                return res.json();
            } catch (e) { return []; }
        }
    });

    const { data: orders = [] } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            try {
                const res = await fetch(`${baseUrl}/sales/orders`);
                if (!res.ok) return [];
                return res.json();
            } catch (e) { return []; }
        }
    });

    // Derived Metrics
    const totalRevenue = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
    const lowStockCount = products.filter(p => (p.stock || 0) <= (p.minStock || 10)).length;
    const totalEmployees = employees.length;

    const uploadMutation = useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            const baseUrl = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${baseUrl}/finance/upload`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Upload failed');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['transactions']);
            alert('Data imported and dashboard updated!');
        },
        onError: (err) => {
            alert('Failed to import data: ' + err.message);
        }
    });

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadMutation.mutate(file);
        }
    };

    // MOCK DATA FOR VISUALIZATION
    // DYNAMIC DATA FOR VISUALIZATION
    const mockKPIs = [
        {
            title: "Total Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            change: "+12.5%", // Keep mock trend for now
            trend: "up",
            icon: DollarSign,
            color: "emerald"
        },
        {
            title: "Active Orders",
            value: activeOrders.toString(),
            change: "+3.2%",
            trend: "up",
            icon: ShoppingCart,
            color: "blue"
        },
        {
            title: "Low Stock Items",
            value: lowStockCount.toString(),
            change: products.length > 0 ? `${products.length} Total` : "0",
            trend: "down",
            icon: Package,
            color: "amber"
        },
        {
            title: "Total Employees",
            value: totalEmployees.toString(),
            change: "+0",
            trend: "up",
            icon: Users,
            color: "indigo"
        }
    ];

    // Process transactions for the Chart
    const processChartData = () => {
        if (!transactions.length) return [];

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();

        // Initialize last 7 months or so
        const dataMap = new Map();

        transactions.forEach(t => {
            const date = new Date(t.date);
            // Simple logic: If valid date
            if (!isNaN(date)) {
                const monthName = months[date.getMonth()];
                if (!dataMap.has(monthName)) {
                    dataMap.set(monthName, { name: monthName, revenue: 0, expenses: 0, order: date.getMonth() });
                }

                const amount = Number(t.amount) || 0;
                // Assumption: Positive = Revenue, Negative = Expense (or based on type if available)
                // For this simple version, let's assume > 0 is Revenue, < 0 is Expense
                if (amount >= 0) {
                    dataMap.get(monthName).revenue += amount;
                } else {
                    dataMap.get(monthName).expenses += Math.abs(amount);
                }
            }
        });

        // Convert to array and sort by month order
        const chartData = Array.from(dataMap.values()).sort((a, b) => a.order - b.order);

        // If empty, return mock data layout or empty
        return chartData.length > 0 ? chartData : [
            { name: 'No Data', revenue: 0, expenses: 0 }
        ];
    };

    const revenueData = processChartData();

    const mockActivities = [
        { id: 1, user: "Sarah Wilson", action: "created new order", target: "#ORD-2024-001", time: "2 mins ago", type: "order" },
        { id: 2, user: "Mike Brown", action: "updated stock for", target: "Wireless Headphones", time: "15 mins ago", type: "inventory" },
        { id: 3, user: "System", action: "generated monthly report", target: "Finance_May_2024.pdf", time: "1 hour ago", type: "system" },
        { id: 4, user: "Jane Doe", action: "approved leave request", target: "John Smith", time: "3 hours ago", type: "hr" },
        { id: 5, user: "Alex Jones", action: "added new supplier", target: "TechParts Inc.", time: "5 hours ago", type: "purchasing" },
    ];

    return (
        <motion.div
            className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={cardVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls"
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current.click()}
                        className="gap-2 shadow-sm bg-white"
                        disabled={uploadMutation.isPending}
                    >
                        <Upload className="w-4 h-4" />
                        {uploadMutation.isPending ? 'Importing...' : 'Import Excel'}
                    </Button>

                    <Button
                        onClick={() => navigate('/finance/reports')}
                        className="gap-2 shadow-sm"
                    >
                        <DollarSign className="w-4 h-4" />
                        Generate Report
                    </Button>
                </div>
            </motion.div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockKPIs.map((kpi, index) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={index} variants={cardVariants} custom={index}>
                            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 h-full">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2.5 rounded-lg bg-${kpi.color}-50 text-${kpi.color}-600 ring-1 ring-${kpi.color}-100`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <Badge variant={kpi.trend === 'up' ? 'success' : 'destructive'} className="flex items-center gap-1 font-medium">
                                            {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                            {kpi.change}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Financial Chart */}
                <motion.div variants={cardVariants} className="lg:col-span-2">
                    <Card className="shadow-sm border-slate-200 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base font-semibold">Revenue Analytics</CardTitle>
                            <div className="w-[180px]">
                                <Select defaultValue="Year">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7M">Last 7 Months</SelectItem>
                                        <SelectItem value="Year">This Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} dx={-10} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`$${value}`, undefined]}
                                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                        <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Activities */}
                <motion.div variants={cardVariants}>
                    <Card className="shadow-sm border-slate-200 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                            <Button
                                variant="link"
                                onClick={() => navigate('/audit')}
                                className="text-indigo-600 hover:text-indigo-700 h-auto p-0 font-medium text-sm"
                            >
                                View All
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {mockActivities.map((activity) => (
                                    <div key={activity.id} className="flex gap-4 relative group">
                                        {/* Timeline line */}
                                        <div className="absolute left-[19px] top-8 bottom-[-24px] w-px bg-slate-200 group-last:hidden"></div>

                                        <div className="flex-shrink-0 relative z-10">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                                                {activity.type === 'order' && <ShoppingCart className="w-4 h-4 text-blue-600" />}
                                                {activity.type === 'inventory' && <Package className="w-4 h-4 text-amber-600" />}
                                                {activity.type === 'system' && <Activity className="w-4 h-4 text-slate-600" />}
                                                {activity.type === 'hr' && <Users className="w-4 h-4 text-emerald-600" />}
                                                {activity.type === 'purchasing' && <DollarSign className="w-4 h-4 text-purple-600" />}
                                            </div>
                                        </div>
                                        <div className="flex-1 pb-1">
                                            <p className="text-sm text-slate-900 leading-snug">
                                                <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-medium text-slate-700">"{activity.target}"</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" />
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Actions / Tasks */}
                <motion.div variants={cardVariants}>
                    <Card className="shadow-sm border-slate-200 h-full">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-semibold">Pending Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Alert variant="warning" className="bg-orange-50/50 border-orange-100 flex items-start gap-3 p-4">
                                    <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5 relative !left-0 !top-0 !translate-y-0" />
                                    <div className="flex-1">
                                        <AlertTitle className="text-orange-900 font-semibold text-sm mb-1">Purchase Orders Review</AlertTitle>
                                        <AlertDescription className="text-orange-700 text-xs">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <span>3 orders &gt; $1,000 awaiting approval</span>
                                                <Button
                                                    onClick={() => navigate('/purchasing/orders')}
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-white text-orange-700 border-orange-200 hover:bg-orange-50 hover:text-orange-800 h-8 px-3 text-xs w-full sm:w-auto"
                                                >
                                                    Review Now
                                                </Button>
                                            </div>
                                        </AlertDescription>
                                    </div>
                                </Alert>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-sm text-slate-900">Leave Requests</h4>
                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100">Action Required</Badge>
                                </div>
                                <Card className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                    <PendingLeaveWidget />
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Links */}
                <motion.div variants={cardVariants}>
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-lg relative overflow-hidden h-full">
                        {/* Abstract Background Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-400 via-slate-900 to-transparent pointer-events-none"></div>

                        <CardHeader className="pb-4 relative z-10">
                            <CardTitle className="text-lg font-bold text-white tracking-tight">Quick Access</CardTitle>
                            <p className="text-slate-400 text-sm">Frequently used tools and modules.</p>
                        </CardHeader>

                        <CardContent className="relative z-10">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/sales/orders')}
                                    className="h-auto py-5 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all flex-col gap-3 group w-full border border-white/5 hover:border-white/10"
                                >
                                    <div className="p-2.5 rounded-full bg-blue-500/20 text-blue-300 group-hover:text-blue-200 group-hover:bg-blue-500/30 transition-colors">
                                        <ShoppingCart className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-200 group-hover:text-white">New Order</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/hr/employees')}
                                    className="h-auto py-5 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all flex-col gap-3 group w-full border border-white/5 hover:border-white/10"
                                >
                                    <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-300 group-hover:text-emerald-200 group-hover:bg-emerald-500/30 transition-colors">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-200 group-hover:text-white">Add Employee</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/inventory/products')}
                                    className="h-auto py-5 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all flex-col gap-3 group w-full border border-white/5 hover:border-white/10"
                                >
                                    <div className="p-2.5 rounded-full bg-amber-500/20 text-amber-300 group-hover:text-amber-200 group-hover:bg-amber-500/30 transition-colors">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-200 group-hover:text-white">Add Product</span>
                                </Button>

                                <Button
                                    variant="ghost"
                                    onClick={() => navigate('/finance/journal')}
                                    className="h-auto py-5 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all flex-col gap-3 group w-full border border-white/5 hover:border-white/10"
                                >
                                    <div className="p-2.5 rounded-full bg-purple-500/20 text-purple-300 group-hover:text-purple-200 group-hover:bg-purple-500/30 transition-colors">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-200 group-hover:text-white">Record Expense</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default DashboardHome;
