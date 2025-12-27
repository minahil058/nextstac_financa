import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, AlertCircle, Loader2, Eye, EyeOff, Shield, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('super_admin'); // Default request
    const [department, setDepartment] = useState(''); // New State
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const result = await register(name, email, password, role, department);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative overflow-hidden">
                <motion.div
                    className="w-full max-w-md space-y-8 relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="text-center lg:text-left">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 mx-auto lg:mx-0 shadow-lg shadow-indigo-500/30">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create an account</h1>
                        <p className="mt-2 text-slate-500">Start managing your business today.</p>
                    </motion.div>

                    <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-3 border border-red-100 animate-in slide-in-from-top-2 fade-in">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-5">
                            <div className="space-y-1.5 group">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Account Type</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 bg-white shadow-sm appearance-none"
                                    >
                                        <option value="super_admin">Business Owner (Super Admin)</option>
                                        <option value="ecommerce_admin">Admin / Manager</option>
                                        <option value="dev_admin">Developer / Tech</option>
                                        <option value="user">Employee (Staff)</option>
                                    </select>
                                    <div className="absolute right-3.5 top-3.5 pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Department Selection for Employees */}
                            {role === 'user' && (
                                <div className="space-y-1.5 group animate-in slide-in-from-top-2 fade-in">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">Department</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        <select
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 bg-white shadow-sm appearance-none"
                                            onChange={(e) => setDepartment(e.target.value)}
                                            defaultValue=""
                                            required
                                        >
                                            <option value="" disabled>Select Department</option>
                                            <option value="E-commerce">E-commerce</option>
                                            <option value="Web Development">Web Development</option>
                                        </select>
                                        <div className="absolute right-3.5 top-3.5 pointer-events-none">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5 group">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 bg-white shadow-sm"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 group">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 bg-white shadow-sm"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 group">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 bg-white shadow-sm"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors p-0.5 rounded focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </motion.form>

                    <motion.div variants={itemVariants} className="pt-6 border-t border-slate-200 text-center">
                        <p className="text-slate-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* Right Side - Feature Showcase */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Join 10,000+ businesses</h2>
                    <p className="text-slate-400 text-lg">Scale your operations with our all-in-one ERP solution.</p>
                </div>
            </div>
        </div>
    );
}
