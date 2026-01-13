import React, { useEffect } from 'react';
import { XIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon, OfflineIcon } from './Icons';
import { NotificationType } from '../types';

interface NotificationToastProps {
    message: string;
    type: NotificationType;
    title?: string;
    onDismiss: () => void;
}

const ICONS: Record<NotificationType, React.ReactNode> = {
    success: <CheckCircleIcon className="w-6 h-6 text-emerald-500" />,
    error: <XCircleIcon className="w-6 h-6 text-red-500" />,
    info: <InformationCircleIcon className="w-6 h-6 text-sky-500" />,
    offline: <OfflineIcon className="w-6 h-6 text-slate-500" />,
};

const BORDERS: Record<NotificationType, string> = {
    success: 'border-emerald-500',
    error: 'border-red-500',
    info: 'border-sky-500',
    offline: 'border-slate-500',
};

const TITLES: Record<NotificationType, string> = {
    success: 'Success',
    error: 'Error',
    info: 'Information',
    offline: 'Offline Mode',
};

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, title, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 7000); // Auto-dismiss after 7 seconds

        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={`bg-white rounded-xl shadow-2xl p-4 w-full max-w-sm flex items-start gap-4 animate-fade-in border-l-4 ${BORDERS[type]}`}>
            <div className="flex-shrink-0 mt-1">
                {ICONS[type]}
            </div>
            <div className="flex-grow">
                <p className="font-bold text-slate-800">{title || TITLES[type]}</p>
                <p className="text-sm text-slate-600">{message}</p>
            </div>
            <button onClick={onDismiss} className="p-1 text-slate-500 hover:bg-slate-100 rounded-full flex-shrink-0">
                <XIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default NotificationToast;