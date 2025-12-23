import { clsx } from 'clsx';

export default function StatusToggle({
    currentStatus,
    onUpdate,
    activeValue = 'Active',
    inactiveValue = 'Inactive'
}) {
    const isActive = currentStatus === activeValue;

    const handleToggle = (e) => {
        // Stop propagation to prevent triggering parent click events (like card expansion)
        e.stopPropagation();
        const newStatus = isActive ? inactiveValue : activeValue;
        onUpdate(newStatus);
    };

    return (
        <button
            onClick={handleToggle}
            className="group flex items-center gap-3 focus:outline-none"
            title={`Click to ${isActive ? 'Deactivate' : 'Activate'}`}
        >
            {/* Toggle Switch */}
            <div
                className={clsx(
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    isActive ? "bg-green-600" : "bg-slate-200"
                )}
            >
                <span
                    aria-hidden="true"
                    className={clsx(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        isActive ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </div>

            {/* Status Label */}
            <span
                className={clsx(
                    "text-sm font-medium transition-colors",
                    isActive ? "text-green-700" : "text-slate-500"
                )}
            >
                {currentStatus}
            </span>
        </button>
    );
}
