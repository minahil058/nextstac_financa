import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export default function PaymentStatusSelect({ currentStatus, onUpdate }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const statuses = ['Paid', 'Pending', 'Failed'];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
            case 'Pending': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
            case 'Failed': return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getDotColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-emerald-500';
            case 'Pending': return 'bg-amber-500';
            case 'Failed': return 'bg-red-500';
            default: return 'bg-slate-500';
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (status) => {
        if (status !== currentStatus) {
            onUpdate(status);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase transition-all min-w-[110px] justify-between group",
                    getStatusColor(currentStatus),
                    isOpen && "ring-2 ring-offset-1 ring-indigo-500/20"
                )}
            >
                <div className="flex items-center gap-2">
                    <div className={clsx("w-1.5 h-1.5 rounded-full", getDotColor(currentStatus))} />
                    {currentStatus}
                </div>
                <ChevronDown className={clsx("w-3 h-3 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-[140px] bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {statuses.map((status) => (
                        <button
                            key={status}
                            onClick={() => handleSelect(status)}
                            className={clsx(
                                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors mb-0.5 last:mb-0",
                                status === currentStatus
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <div className={clsx("w-1.5 h-1.5 rounded-full", getDotColor(status))} />
                                {status}
                            </div>
                            {status === currentStatus && <Check className="w-3 h-3" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
