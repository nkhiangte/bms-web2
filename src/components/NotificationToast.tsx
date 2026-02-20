import React, { useEffect } from 'react';
import { NotificationType } from '@/types';

interface NotificationToastProps {
    message: string;
    type: NotificationType;
    title?: string;
    onDismiss: () => void;
}

const CONFIG: Record<NotificationType, { border: string; icon: string; iconBg: string; emoji: string }> = {
    success: { border: 'border-l-emerald-500', icon: 'text-emerald-600', iconBg: 'bg-emerald-100', emoji: '✓' },
    error:   { border: 'border-l-red-500',     icon: 'text-red-600',     iconBg: 'bg-red-100',     emoji: '✕' },
    info:    { border: 'border-l-sky-500',      icon: 'text-sky-600',     iconBg: 'bg-sky-100',     emoji: 'ℹ' },
    offline: { border: 'border-l-slate-500',    icon: 'text-slate-600',   iconBg: 'bg-slate-100',   emoji: '⚠' },
};

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, title, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const cfg = CONFIG[type] ?? CONFIG.info;

    return (
        <div className={`flex items-start gap-3 rounded-lg shadow-lg p-4 bg-white border border-slate-200 border-l-4 ${cfg.border}`}>
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${cfg.iconBg} ${cfg.icon}`}>
                {cfg.emoji}
            </div>
            <div className="flex-1 min-w-0">
                {title && <p className="font-semibold text-sm text-slate-800">{title}</p>}
                <p className="text-sm text-slate-600">{message}</p>
            </div>
            <button
                onClick={onDismiss}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
                aria-label="Dismiss"
            >
                ×
            </button>
        </div>
    );
};

export default NotificationToast;
