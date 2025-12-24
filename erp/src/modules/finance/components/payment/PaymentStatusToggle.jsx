import { ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export default function PaymentStatusToggle({ currentStatus, onUpdate }) {
    const statuses = ['Paid', 'Pending', 'Failed'];

    const getNextStatus = () => {
        const currentIndex = statuses.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return statuses[nextIndex];
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Paid':
                return {
                    className: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
                    icon: ArrowUpRight
                };
            case 'Pending':
                return {
                    className: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
                    icon: Clock
                };
            case 'Failed':
                return {
                    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
                    icon: AlertCircle
                };
            default:
                return {
                    className: 'bg-slate-100 text-slate-800 border-slate-200',
                    icon: ArrowUpRight
                };
        }
    };

    const config = getStatusConfig(currentStatus);
    const Icon = config.icon;

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onUpdate(getNextStatus())}
            className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border transition-colors select-none cursor-pointer",
                config.className
            )}
            title="Click to cycle status"
        >
            <Icon className="w-3.5 h-3.5" />
            {currentStatus}
        </motion.button>
    );
}
