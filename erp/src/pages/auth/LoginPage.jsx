import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, Eye, EyeOff, Shield, BarChart3, Globe, Users, Code } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const result = await login(email, password);
            if (result.success) {
                navigate(from, { replace: true });
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
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
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
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
                        <p className="mt-2 text-slate-500">Please enter your details to sign in.</p>
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
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Forgot password?</button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-800 bg-white shadow-sm"
                                        placeholder="••••••••"
                                        required
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
                                    Sign in to account
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </motion.form>

                    <motion.div variants={itemVariants} className="text-center">
                        <p className="text-slate-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-6 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 text-center lg:text-left">Quick Access (Demo)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                onClick={() => { setEmail('admin@test.com'); setPassword('password'); }}
                                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-500/50 hover:bg-indigo-50/50 hover:shadow-md transition-all group text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Shield className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-900">Admin</div>
                                    <div className="text-[10px] text-slate-500 font-mono">admin@test.com</div>
                                </div>
                            </button>
                            <button
                                onClick={() => { setEmail('ecom@test.com'); setPassword('password'); }}
                                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-pink-500/50 hover:bg-pink-50/50 hover:shadow-md transition-all group text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-900">Store</div>
                                    <div className="text-[10px] text-slate-500 font-mono">ecom@test.com</div>
                                </div>
                            </button>
                            <button
                                onClick={() => { setEmail('dev@test.com'); setPassword('password'); }}
                                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-amber-500/50 hover:bg-amber-50/50 hover:shadow-md transition-all group text-left sm:col-span-2"
                            >
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <Code className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-900">Developer</div>
                                    <div className="text-[10px] text-slate-500 font-mono">dev@test.com</div>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Right Side - Feature Showcase */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10"
                        >
                            <BarChart3 className="w-8 h-8 text-emerald-400 mb-4" />
                            <h3 className="text-lg font-bold text-white">Real-time Analytics</h3>
                            <p className="text-sm text-slate-300 mt-2">Track performance with live updates and visual insights.</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mt-8"
                        >
                            <Users className="w-8 h-8 text-blue-400 mb-4" />
                            <h3 className="text-lg font-bold text-white">Team Management</h3>
                            <p className="text-sm text-slate-300 mt-2">Streamline HR processes and employee engagement.</p>
                        </motion.div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center"
                    >
                        <h2 className="text-2xl font-bold text-white mb-2">Enterprise Resource Planning</h2>
                        <p className="text-slate-400 text-sm">Everything you need to manage your business operations in one unified platform.</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
